import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport } from '../types';

export class PDFService {
  static async generateReportPDF(report: AnalysisReport, sessionInfo: any): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    let yPosition = margin;
    
    // 제목
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(75, 85, 99); // gray-600
    pdf.text('BeMore 대화 분석 리포트', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // 생성 날짜
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // 세션 요약
    yPosition = this.addSection(pdf, '세션 요약', yPosition, pageWidth, margin);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81); // gray-700
    
    // 대화 시간
    const durationMinutes = Math.floor(report.sessionDuration / 60);
    const durationSeconds = Math.floor(report.sessionDuration % 60);
    pdf.text(`• 대화 시간: ${durationMinutes}분 ${durationSeconds}초`, margin, yPosition);
    yPosition += 8;
    
    // 총 메시지 수
    pdf.text(`• 총 메시지: ${report.totalMessages}개`, margin, yPosition);
    yPosition += 8;
    
    // 감정 변화
    pdf.text(`• 감정 변화: ${report.emotionTrend}`, margin, yPosition);
    yPosition += 15;
    
    // 주요 인사이트
    yPosition = this.addSection(pdf, '주요 인사이트', yPosition, pageWidth, margin);
    
    report.keyInsights.forEach((insight: string, index: number) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${insight}`, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
    
    // 권장사항
    yPosition = this.addSection(pdf, '권장사항', yPosition, pageWidth, margin);
    
    report.recommendations.forEach((rec: string, index: number) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${rec}`, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
    
    // CBT 기법
    yPosition = this.addSection(pdf, '추천 CBT 기법', yPosition, pageWidth, margin);
    
    report.cbtTechniques.forEach((technique: string, index: number) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${technique}`, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 15;
    
    // 하단 정보
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('이 리포트는 AI 기반 감정 분석과 CBT 전문가의 관점에서 생성되었습니다.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text('BeMore - AI 기반 감정 분석 및 CBT 상담 서비스', pageWidth / 2, yPosition, { align: 'center' });
    
    // PDF 저장
    const fileName = `BeMore_리포트_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
  
  private static addSection(pdf: jsPDF, title: string, yPosition: number, pageWidth: number, margin: number): number {
    // 페이지 넘침 체크
    if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // 섹션 제목
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246); // blue-500
    pdf.text(title, margin, yPosition);
    yPosition += 8;
    
    // 구분선
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;
    
    return yPosition;
  }
  
  // HTML 요소를 PDF로 변환 (모달 내용을 PDF로)
  static async generateModalPDF(modalElement: HTMLElement): Promise<void> {
    try {
      const canvas = await html2canvas(modalElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지 비율 계산
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 여러 페이지로 나누기
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `BeMore_리포트_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      throw new Error('PDF 생성 중 오류가 발생했습니다.');
    }
  }
} 