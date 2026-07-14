import { Camera } from 'react-native-vision-camera';

export interface OcrResult {
  text: string;
  confidence: number;
  blocks: OcrBlock[];
}

export interface OcrBlock {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ReceiptData {
  vendorName: string | null;
  date: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  items: ReceiptItem[];
  rawText: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number | null;
  price: number | null;
}

class OcrServiceClass {
  private isAvailable = false;

  async checkAvailability(): Promise<boolean> {
    try {
      const status = await Camera.requestCameraPermission();
      this.isAvailable = status === 'authorized';
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  async processImage(imagePath: string): Promise<OcrResult> {
    // In production, use ML Kit or Google Cloud Vision API
    // This is a placeholder that demonstrates the interface
    try {
      const result: OcrResult = {
        text: '',
        confidence: 0,
        blocks: [],
      };

      // Simulate OCR processing
      // In production: use @react-native-ml-kit/text-recognition
      // or Google Cloud Vision API
      return result;
    } catch (error) {
      throw new Error(`OCR processing failed: ${error}`);
    }
  }

  extractReceiptData(ocrResult: OcrResult): ReceiptData {
    const text = ocrResult.text;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const receiptData: ReceiptData = {
      vendorName: this.extractVendorName(lines),
      date: this.extractDate(lines),
      totalAmount: this.extractTotalAmount(lines),
      taxAmount: this.extractTaxAmount(lines),
      items: this.extractItems(lines),
      rawText: text,
    };

    return receiptData;
  }

  private extractVendorName(lines: string[]): string | null {
    // Usually the first few lines contain the vendor name
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Skip lines that look like dates or numbers
      if (!/^\d/.test(firstLine) && firstLine.length > 2) {
        return firstLine;
      }
    }
    return lines[0] || null;
  }

  private extractDate(lines: string[]): string | null {
    const datePatterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i,
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }
    return null;
  }

  private extractTotalAmount(lines: string[]): number | null {
    const totalPatterns = [
      /(?:total|amount|grand total|net amount|balance)[\s:]*[\u20B9$]?\s*([\d,]+\.?\d*)/i,
      /[\u20B9$]\s*([\d,]+\.?\d*)/g,
    ];

    // First try to find explicit "total" line
    for (const line of lines) {
      const match = line.match(totalPatterns[0]);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }

    // Fallback: find the largest amount on the receipt
    let maxAmount = 0;
    for (const line of lines) {
      const matches = line.matchAll(totalPatterns[1]);
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > maxAmount) {
          maxAmount = amount;
        }
      }
    }

    return maxAmount > 0 ? maxAmount : null;
  }

  private extractTaxAmount(lines: string[]): number | null {
    const taxPatterns = [
      /(?:gst|tax|vat|service tax|cgst|sgst|igst)[\s:]*[\u20B9$]?\s*([\d,]+\.?\d*)/i,
    ];

    for (const line of lines) {
      for (const pattern of taxPatterns) {
        const match = line.match(pattern);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
    return null;
  }

  private extractItems(lines: string[]): ReceiptItem[] {
    const items: ReceiptItem[] = [];
    const itemPattern = /^(.+?)\s+([\d.]+)\s*x\s*([\d,.]+)\s*=?\s*[\u20B9$]?\s*([\d,.]+)/i;

    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        items.push({
          name: match[1].trim(),
          quantity: parseFloat(match[2]),
          price: parseFloat(match[4].replace(/,/g, '')),
        });
      }
    }

    return items;
  }

  async captureAndProcess(): Promise<ReceiptData> {
    const hasPermission = await this.checkAvailability();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    // In production: use Vision Camera to capture image
    // then process with OCR
    throw new Error('Not implemented - use Vision Camera directly');
  }
}

export const OcrService = new OcrServiceClass();
