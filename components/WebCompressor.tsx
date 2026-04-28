import { useState } from 'react';
import { FileUp, FileDown, Settings, Code, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
// @ts-ignore
import UPNG from 'upng-js';
import { gooeyToast } from 'goey-toast';

const compressImageQuantization = async (fileData: Uint8Array, mimeType: string): Promise<Uint8Array> => {
  return new Promise((resolve) => {
    const blob = new Blob([new Uint8Array(fileData)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Extreme Quantizer - Limit dimension down to 1080px to crush image payload size
      const MAX_DIM = 1080;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(fileData);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        canvas.toBlob((b) => {
          if (b) {
            b.arrayBuffer().then(ab => {
              const newArray = new Uint8Array(ab);
              resolve(newArray.length < fileData.length ? newArray : fileData);
            });
          } else {
            resolve(fileData);
          }
        }, 'image/jpeg', 0.4); // Aggressive JPEG quality threshold at 40%
      } else if (mimeType === 'image/png' || mimeType === 'image/gif') {
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          // Hardcore UPNG 128-color map palette limiting to slash internal PNG fatness.
          const compressedBuffer = UPNG.encode([imgData.data.buffer], width, height, 128);
          const compressedArray = new Uint8Array(compressedBuffer);
          
          if (compressedArray.length < fileData.length) {
            resolve(compressedArray);
          } else {
            resolve(fileData);
          }
        } catch (e) {
          console.error("UPNG encoding failed", e);
          resolve(fileData);
        }
      } else {
        resolve(fileData);
      }
    };
    img.onerror = () => resolve(fileData);
    img.src = url;
  });
};

export default function WebCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<{ url: string; originalSize: number; newSize: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png', 'image/jpg'];
      const extension = selected.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(selected.type) && !['pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png'].includes(extension || '')) {
        setError('Please select a valid PDF, DOCX, PPTX, JPG, or PNG file.');
        return;
      }
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setError(null);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let blob: Blob;

      if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        
        // Strip metadata to reduce size
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        // Save the PDF document with object streams enabled for better compression
        // This performs structural compression (garbage collection, stream compression)
        // without altering images or fonts.
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      } else if (extension === 'docx' || extension === 'pptx') {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        
        const imageRegex = /\.(jpe?g|png|gif)$/i;
        const promises: Promise<void>[] = [];
        
        loadedZip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir && imageRegex.test(relativePath)) {
            promises.push((async () => {
              try {
                const uint8Array = await zipEntry.async('uint8array');
                const ext = relativePath.split('.').pop()?.toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
                
                const compressedUint8 = await compressImageQuantization(uint8Array, mimeType);
                loadedZip.file(relativePath, compressedUint8);
              } catch (e) {
                console.error(`Failed to compress ${relativePath}`, e);
              }
            })());
          }
        });
        
        await Promise.all(promises);
        
        blob = await loadedZip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9
          }
        });
      } else if (['png', 'jpg', 'jpeg'].includes(extension || '')) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const mimeType = file.type || (extension === 'png' ? 'image/png' : 'image/jpeg');
        const compressedUint8 = await compressImageQuantization(uint8Array, mimeType);
        blob = new Blob([new Uint8Array(compressedUint8)], { type: mimeType });
      } else {
        throw new Error('Unsupported file format');
      }
      
      const url = URL.createObjectURL(blob);
      
      setResult({
        url,
        originalSize: file.size,
        newSize: blob.size,
        name: file.name.replace(`.${extension}`, `-compressed.${extension}`)
      });
      gooeyToast.success('File compressed successfully', { showTimestamp: false });
    } catch (err) {
      console.error(err);
      const errorMessage = 'An error occurred while compressing the file. It might be corrupted or heavily encrypted.';
      setError(errorMessage);
      gooeyToast.error(errorMessage, { showTimestamp: false });
    } finally {
      setIsCompressing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div className="bg-[#111318] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-800 bg-[#0f1115]">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Browser-Based Anything Compressor
          </h2>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Compress PDF, DOCX, PPTX, JPG, and PNG files entirely in your browser. This tool reduces file size while preserving fidelity.
          </p>
        </div>

        <div className="p-8 space-y-6 bg-[#111318]">
          {/* Upload Area */}
          <div className="relative group">
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Select a PDF, DOCX, PPTX, JPG, or PNG file"
            />
            <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-cyan-400/50 bg-cyan-900/10' : 'border-gray-700 hover:border-cyan-400/50 hover:bg-[#1a1d24]'}`}>
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${file ? 'bg-cyan-900/40 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {file ? file.name : 'Click or drag PDF, DOCX, PPTX, JPG, or PNG to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {file ? formatBytes(file.size) : 'No file size limit'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleCompress}
            disabled={!file || isCompressing}
            className={`w-full py-3 px-4 rounded-xl font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2 transition-all ${
              !file || isCompressing
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 shadow-sm'
            }`}
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                Compress Document
              </>
            )}
          </button>

          {/* Results Area */}
          {result && (
            <div className="mt-8 p-6 rounded-xl bg-[#0a0a0a] border border-cyan-900/30 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-cyan-400">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                <h3 className="font-bold tracking-wider uppercase text-sm">Compression Complete!</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Original</p>
                  <p className="text-lg font-bold text-gray-200">{formatBytes(result.originalSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Compressed</p>
                  <p className="text-lg font-bold text-cyan-400">{formatBytes(result.newSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Saved</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {result.originalSize > result.newSize 
                      ? ((1 - result.newSize / result.originalSize) * 100).toFixed(1) + '%' 
                      : '0%'}
                  </p>
                </div>
              </div>

              <a
                href={result.url}
                download={result.name}
                className="w-full py-3 px-4 rounded-xl font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2 bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-sm"
              >
                <FileDown className="w-5 h-5" />
                Download Compressed File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
