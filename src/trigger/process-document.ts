import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { typesenseClient } from "@/lib/typesense";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessDocumentPayload {
  documentId: string;
  title: string;
  content: string;
  fileType?: string;
}

export const processDocumentTask = task({
  id: "process-document",
  run: async (payload: ProcessDocumentPayload) => {
    const { documentId, title, content, fileType } = payload;
    
    console.log(`Processing document ${documentId}: ${title}`);

    try {
      // Step 1: Generate AI summary/keywords
      console.log("Generating AI summary...");
      
      const fileTypeInfo = fileType ? ` (${fileType.toUpperCase()} file)` : '';
      const systemPrompt = fileType === 'docx' || fileType === 'doc' 
        ? "You are a helpful assistant that creates concise summaries and extracts key topics from Word documents. Pay attention to document structure, headings, and formatting. Respond with a JSON object containing 'summary' and 'keywords' fields."
        : "You are a helpful assistant that creates concise summaries and extracts key topics from documents. Respond with a JSON object containing 'summary' and 'keywords' fields.";
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please analyze this document${fileTypeInfo} and provide a summary and keywords:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}...`
          }
        ],
        max_tokens: 200,
      });

      let aiAnalysis = { summary: "", keywords: [] };
      try {
        aiAnalysis = JSON.parse(completion.choices[0].message.content || "{}");
      } catch {
        aiAnalysis = {
          summary: completion.choices[0].message.content || "AI analysis failed",
          keywords: []
        };
      }

      // Step 2: Index document in Typesense
      console.log("Indexing in Typesense...");
      const typesenseDoc = {
        id: documentId,
        title,
        content: content.substring(0, 5000), // Limit content length for search
        uploadedAt: Date.now(),
        userId: 'demo-user',
        summary: aiAnalysis.summary,
        keywords: Array.isArray(aiAnalysis.keywords) ? aiAnalysis.keywords.join(', ') : '',
      };

      await typesenseClient.collections('documents').documents().create(typesenseDoc);

      // Step 3: Update database record
      console.log("Updating database...");
      await prisma.document.update({
        where: { id: documentId },
        data: {
          searchable: true,
          typesenseId: documentId,
        }
      });

      console.log(`Document ${documentId} processed successfully`);
      
      return {
        success: true,
        documentId,
        summary: aiAnalysis.summary,
        keywords: aiAnalysis.keywords,
        message: "Document processed and indexed successfully"
      };

    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      
      // Mark document as failed
      await prisma.document.update({
        where: { id: documentId },
        data: { searchable: false }
      });

      throw error;
    }
  },
});
