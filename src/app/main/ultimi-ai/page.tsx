// "use client";
// import { useState, useRef } from "react";

// export default function Home() {
//   const [response, setResponse] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const [isRecording, setIsRecording] = useState<boolean>(false);

//   // Available models (primary and fallback for free tier)
//   const TEXT_MODELS = [
//     "microsoft/DialoGPT-medium", // Primary: Lightweight dialogue model (free, fast)
//     "gpt2" // Fallback: Classic text generation
//   ];
//   const WHISPER_MODELS = [
//     "openai/whisper-tiny", // Primary: Small, free transcription
//     "openai/whisper-base" // Fallback: Slightly larger but still free
//   ];

//   let currentTextModelIndex = 0;
//   let currentWhisperModelIndex = 0;

//   // 🔹 Query Hugging Face Text Model with fallback
//   async function queryLLM(text: string, modelIndex = 0): Promise<string | null> {
//     try {
//       setError("");
//       if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
//         throw new Error("Hugging Face API key is missing");
//       }

//       const modelId = TEXT_MODELS[modelIndex];
//       const res = await fetch(
//         `https://api-inference.huggingface.co/models/${modelId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           method: "POST",
//           body: JSON.stringify({
//             inputs: text,
//             parameters: { max_new_tokens: 300, return_full_text: false },
//           }),
//         }
//       );

//       if (res.status === 404) {
//         if (modelIndex + 1 < TEXT_MODELS.length) {
//           console.log(`Model ${modelId} not found, trying fallback...`);
//           currentTextModelIndex = modelIndex + 1;
//           return queryLLM(text, modelIndex + 1); // Recursive fallback
//         }
//         throw new Error(`All text models unavailable. Check free tier limits.`);
//       }
//       if (!res.ok) {
//         throw new Error(`HTTP error! Status: ${res.status}`);
//       }

//       const data = await res.json();
//       return data[0]?.generated_text || "No response generated";
//     } catch (err: any) {
//       console.error("Error calling LLM:", err);
//       setError(err.message || "Failed to process text request");
//       return null;
//     }
//   }

//   // 🔹 Transcribe Audio with Whisper and fallback
//   async function transcribeAudio(audioBlob: Blob, modelIndex = 0): Promise<string | null> {
//     try {
//       setError("");
//       if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
//         throw new Error("Hugging Face API key is missing");
//       }

//       const modelId = WHISPER_MODELS[modelIndex];
//       const res = await fetch(
//         `https://api-inference.huggingface.co/models/${modelId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
//           },
//           method: "POST",
//           body: audioBlob,
//         }
//       );

//       if (res.status === 404) {
//         if (modelIndex + 1 < WHISPER_MODELS.length) {
//           console.log(`Whisper model ${modelId} not found, trying fallback...`);
//           currentWhisperModelIndex = modelIndex + 1;
//           return transcribeAudio(audioBlob, modelIndex + 1); // Recursive fallback
//         }
//         throw new Error(`All Whisper models unavailable. Check free tier limits.`);
//       }
//       if (!res.ok) {
//         throw new Error(`HTTP error! Status: ${res.status}`);
//       }

//       const data = await res.json();
//       return data.text || null;
//     } catch (err: any) {
//       console.error("Error calling Whisper:", err);
//       setError(err.message || "Failed to transcribe audio");
//       return null;
//     }
//   }

//   // 🔹 Handle File Upload (TXT only)
//   async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.type !== "text/plain") {
//       setError("Please upload a TXT file");
//       return;
//     }

//     try {
//       setLoading(true);
//       const text = await file.text();
//       const res = await queryLLM("Summarize this content:\n\n" + text);

//       if (res) {
//         setResponse(res);
//       } else {
//         setResponse("No summary generated");
//       }
//     } catch (err) {
//       setError("Error processing file");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 🔹 Handle Text Prompt
//   async function handlePrompt(prompt: string) {
//     if (!prompt.trim()) {
//       setError("Please enter a valid prompt");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await queryLLM(prompt);
//       if (res) {
//         setResponse(res);
//       } else {
//         setResponse("No response generated");
//       }
//     } catch (err) {
//       // Error handled in queryLLM
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 🔹 Handle Voice Recording
//   async function startRecording() {
//     try {
//       setError("");
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       const chunks: BlobPart[] = [];

//       mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

//       mediaRecorder.onstop = async () => {
//         const audioBlob = new Blob(chunks, { type: "audio/wav" });
//         const transcript = await transcribeAudio(audioBlob);

//         if (transcript) {
//           const res = await queryLLM("Answer this: " + transcript);
//           if (res) {
//             setResponse(res);
//           }
//         }
//         stream.getTracks().forEach(track => track.stop()); // Clean up stream
//       };

//       mediaRecorderRef.current = mediaRecorder;
//       setIsRecording(true);
//       mediaRecorder.start();
//       setTimeout(() => mediaRecorder.stop(), 10000); // Auto-stop after 10s for demo
//     } catch (err) {
//       setError("Failed to start recording. Please check microphone permissions.");
//     }
//   }

//   function stopRecording() {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
//       <div className="w-full max-w-2xl space-y-6">
//         <h1 className="text-3xl font-bold text-gray-800 text-center">AI Assistant</h1>
//         <p className="text-sm text-gray-600 text-center">
//           Using free-tier models: {TEXT_MODELS[0]} for text, {WHISPER_MODELS[0]} for audio.
//         </p>

//         {/* Error Message */}
//         {error && (
//           <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
//             {error}
//             {error.includes("not found") && (
//               <p className="mt-2 text-sm">
//                 Tip: Upgrade to PRO at{" "}
//                 <a
//                   href="https://huggingface.co/pricing"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="underline text-blue-600"
//                 >
//                   Hugging Face PRO
//                 </a>{" "}
//                 for advanced models like Mixtral.
//               </p>
//             )}
//           </div>
//         )}

//         {/* File Upload */}
//         <div className="flex flex-col gap-2">
//           <label className="text-sm font-medium text-gray-600">Upload TXT File</label>
//           <input
//             type="file"
//             accept=".txt"
//             onChange={handleFile}
//             className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Text Input */}
//         <div className="flex flex-col gap-2">
//           <label className="text-sm font-medium text-gray-600">Ask a Question</label>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               placeholder="Type your question here..."
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   handlePrompt((e.target as HTMLInputElement).value);
//                   (e.target as HTMLInputElement).value = "";
//                 }
//               }}
//               className="flex-1 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={() => handlePrompt((document.querySelector('input[type="text"]') as HTMLInputElement)?.value || "")}
//               className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Send
//             </button>
//           </div>
//         </div>

//         {/* Voice Recording */}
//         <div className="flex gap-4 justify-center flex-wrap">
//           <button
//             onClick={startRecording}
//             disabled={isRecording}
//             className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
//               isRecording
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {isRecording ? "🎤 Recording..." : "🎤 Start Recording"}
//           </button>
//           <button
//             onClick={stopRecording}
//             disabled={!isRecording}
//             className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
//               !isRecording
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-red-600 hover:bg-red-700"
//             }`}
//           >
//             ⏹ Stop Recording
//           </button>
//         </div>

//         {/* Response */}
//         <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm min-h-[150px]">
//           {loading ? (
//             <div className="flex items-center justify-center h-full">
//               <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mr-2"></div>
//               <span>Processing...</span>
//             </div>
//           ) : (
//             <p className="text-gray-700 whitespace-pre-wrap">{response || "Ready for your input!"}</p>
//           )}
//         </div>

//         {/* Debug Info */}
//         <details className="text-xs text-gray-500">
//           <summary>Debug: Current Models</summary>
//           <p>Text: {TEXT_MODELS[currentTextModelIndex]}</p>
//           <p>Whisper: {WHISPER_MODELS[currentWhisperModelIndex]}</p>
//         </details>
//       </div>
//     </main>
//   );
// }


import Box from '@/components/ui/box';
import React from 'react';

interface ComingSoonProps {
  text: string;
}
const ComingSoon: React.FC<ComingSoonProps> = ({ text }) => {
  return (
    <Box className="dark:bg-[#18181b] flex item-center justify-center h-screen">
      <Box>
        <Box as="p" className="mt-[70px]  text-center mb-4 text-[60px]">
          🚧
        </Box>
        <Box as="p" className="text-center">
          {text || 'Under Construction'}
        </Box>
      </Box>
    </Box>
  );
};

export default ComingSoon;
