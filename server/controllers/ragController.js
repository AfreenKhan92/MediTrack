import mongoose from 'mongoose';
import MedicalReport from '../models/MedicalReport.js';
import { retrieveRelevantChunks } from '../services/ragRetrieval.service.js';
import { answerFromChunks, fallbackAnswer } from '../services/ragAnswer.service.js';

const objectIdPattern = /^[a-f\d]{24}$/i;

function isValidObjectIdString(value) {
  return typeof value === 'string' && objectIdPattern.test(value);
}

function isValidQuestion(question) {
  return typeof question === 'string' && question.trim().length >= 3 && question.trim().length <= 1000;
}

function parseReportIds(reportIds) {
  if (reportIds === undefined) return null;
  if (
    !Array.isArray(reportIds) ||
    reportIds.length > 10 ||
    reportIds.some((id) => !isValidObjectIdString(id)) ||
    new Set(reportIds).size !== reportIds.length
  ) {
    return undefined;
  }
  return reportIds;
}

function reportLabel(report) {
  return report.title || 'Medical report';
}

export const askRagQuestion = async (req, res) => {
  const question = req.body?.question;
  const reportIds = parseReportIds(req.body?.reportIds);

  if (!isValidQuestion(question) || reportIds === undefined) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  const authorizedIds = reportIds?.map((id) => new mongoose.Types.ObjectId(id));
  let authorizedReports;
  try {
    authorizedReports = await MedicalReport.find(
      reportIds
        ? { _id: { $in: authorizedIds }, user: userId }
        : { user: userId }
    );
  } catch {
    return res.status(500).json({ message: 'Request failed' });
  }

  if (reportIds && authorizedReports.length !== reportIds.length) {
    return res.status(404).json({ message: 'Report not found' });
  }

  const topK = Number.parseInt(process.env.RAG_TOP_K || '6', 10);
  const retrievalLimit = Number.isInteger(topK) && topK > 0 ? Math.min(topK, 20) : 6;
  let chunks = [];
  try {
    if (reportIds?.length) {
      for (const reportId of reportIds) {
        chunks.push(
          ...(await retrieveRelevantChunks({
            userId,
            reportId,
            question: question.trim(),
            limit: retrievalLimit,
          }))
        );
      }
    } else {
      chunks = await retrieveRelevantChunks({
        userId,
        question: question.trim(),
        limit: retrievalLimit,
      });
    }
  } catch {
    return res.status(503).json({ message: 'Retrieval unavailable' });
  }

  const returnedReportIds = [
    ...new Set(
      chunks
        .map((chunk) => chunk.reportId?.toString())
        .filter((reportId) => reportId)
    ),
  ];
  let ownedReturnedReports;
  try {
    ownedReturnedReports = await MedicalReport.find({
      _id: { $in: returnedReportIds },
      user: userId,
    });
  } catch {
    return res.status(500).json({ message: 'Request failed' });
  }

  const ownedReportIds = new Set(
    ownedReturnedReports.map((report) => report._id.toString())
  );
  const requestedReportIds = reportIds ? new Set(reportIds) : null;
  chunks = chunks.filter((chunk) => {
    const reportId = chunk.reportId?.toString();
    return (
      reportId &&
      ownedReportIds.has(reportId) &&
      (!requestedReportIds || requestedReportIds.has(reportId))
    );
  });

  if (!chunks.length) return res.status(200).json(fallbackAnswer());

  try {
    const reportsById = new Map(
      ownedReturnedReports.map((report) => [report._id.toString(), report])
    );
    const result = await answerFromChunks({
      question: question.trim(),
      chunks,
      reports: [...reportsById.values()],
    });
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({ message: 'Answer service unavailable' });
  }
};

export default { askRagQuestion };
