import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport } from '../types';
import notoSansKR from '../assets/fonts/NotoSansKR-VariableFont-normal.js';

export class PDFService {
  static async generateReportPDF(report: AnalysisReport, sessionInfo: any): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addFileToVFS('NotoSansKR-VariableFont.ttf', notoSansKR);
    pdf.addFont('NotoSansKR-VariableFont.ttf', 'NotoSansKR', 'normal');
    pdf.setFont('NotoSansKR', 'normal');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // 스타일 변수
    const cardPaddingY = 12;
    const cardPaddingX = 12;
    const lineHeight = 7.5;
    const sectionTitleGap = 8;
    const listGap = 4.5;
    const cardRadius = 10;
    const cardFontSize = 12;
    const cardTitleFontSize = 14;
    const cardSpacing = 14;
    const cardPurple: [number, number, number] = [243, 240, 255]; // 연보라
    const cardBlue: [number, number, number] = [232, 240, 255]; // 연파랑

    // 카드 높이 동적 계산 함수 (splitTextToSize로 실제 줄 수 계산)
    const getCardHeight = (list: string[]) => {
      let totalLines = 0;
      list.forEach(item => {
        const lines = pdf.splitTextToSize(`• ${item}`, contentWidth - cardPaddingX * 2 - 4);
        totalLines += lines.length;
      });
      return cardPaddingY * 2 + sectionTitleGap + totalLines * lineHeight + (list.length - 1) * listGap;
    };

    // 카드 그리기 함수
    const drawCard = (y: number, h: number, color: [number, number, number]) => {
      pdf.setFillColor(...color);
      pdf.roundedRect(margin, y, contentWidth, h, cardRadius, cardRadius, 'F');
    };

    // 제목
    pdf.setFontSize(26);
    pdf.setFont('NotoSansKR', 'normal');
    pdf.setTextColor(124, 58, 237); // 보라
    pdf.text('BeMore 대화 분석 리포트', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 18;

    // 생성일
    pdf.setFontSize(12);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // 세션 요약 카드
    const sessionList = [
      `대화 시간: ${Math.floor(report.sessionDuration / 60)}분 ${Math.floor(report.sessionDuration % 60)}초`,
      `총 메시지: ${report.totalMessages}개`,
      `감정 변화: ${report.emotionTrend}`
    ];
    const sessionCardHeight = getCardHeight(sessionList);
    drawCard(yPosition, sessionCardHeight, cardPurple);
    pdf.setFontSize(cardTitleFontSize);
    pdf.setTextColor(124, 58, 237);
    pdf.text('세션 요약', margin + cardPaddingX, yPosition + cardPaddingY);
    pdf.setFontSize(cardFontSize);
    pdf.setTextColor(55, 65, 81);
    let sessionLineY = yPosition + cardPaddingY + sectionTitleGap + lineHeight;
    sessionList.forEach((item, i) => {
      const lines = pdf.splitTextToSize(`• ${item}`, contentWidth - cardPaddingX * 2 - 4);
      lines.forEach((line: string, j: number) => {
        pdf.text(line, margin + cardPaddingX + 2, sessionLineY);
        sessionLineY += lineHeight;
      });
      if (i < sessionList.length - 1) sessionLineY += listGap;
    });
    yPosition += sessionCardHeight + cardSpacing;

    // 주요 인사이트 카드
    const insights = report.keyInsights;
    const insightCardHeight = getCardHeight(insights);
    drawCard(yPosition, insightCardHeight, cardBlue);
    pdf.setFontSize(cardTitleFontSize);
    pdf.setTextColor(99, 102, 241);
    pdf.text('주요 인사이트', margin + cardPaddingX, yPosition + cardPaddingY);
    pdf.setFontSize(cardFontSize);
    pdf.setTextColor(55, 65, 81);
    let insightLineY = yPosition + cardPaddingY + sectionTitleGap + lineHeight;
    insights.forEach((insight, i) => {
      const lines = pdf.splitTextToSize(`• ${insight}`, contentWidth - cardPaddingX * 2 - 4);
      lines.forEach((line: string, j: number) => {
        pdf.text(line, margin + cardPaddingX + 2, insightLineY);
        insightLineY += lineHeight;
      });
      if (i < insights.length - 1) insightLineY += listGap;
    });
    yPosition += insightCardHeight + cardSpacing;

    // 권장사항 카드
    const recs = report.recommendations;
    const recCardHeight = getCardHeight(recs);
    drawCard(yPosition, recCardHeight, cardPurple);
    pdf.setFontSize(cardTitleFontSize);
    pdf.setTextColor(124, 58, 237);
    pdf.text('권장사항', margin + cardPaddingX, yPosition + cardPaddingY);
    pdf.setFontSize(cardFontSize);
    pdf.setTextColor(55, 65, 81);
    let recLineY = yPosition + cardPaddingY + sectionTitleGap + lineHeight;
    recs.forEach((rec, i) => {
      const lines = pdf.splitTextToSize(`• ${rec}`, contentWidth - cardPaddingX * 2 - 4);
      lines.forEach((line: string, j: number) => {
        pdf.text(line, margin + cardPaddingX + 2, recLineY);
        recLineY += lineHeight;
      });
      if (i < recs.length - 1) recLineY += listGap;
    });
    yPosition += recCardHeight + cardSpacing;

    // 추천 CBT 기법 카드
    const cbts = report.cbtTechniques;
    const cbtCardHeight = getCardHeight(cbts);
    drawCard(yPosition, cbtCardHeight, cardBlue);
    pdf.setFontSize(cardTitleFontSize);
    pdf.setTextColor(99, 102, 241);
    pdf.text('추천 CBT 기법', margin + cardPaddingX, yPosition + cardPaddingY);
    pdf.setFontSize(cardFontSize);
    pdf.setTextColor(55, 65, 81);
    let cbtLineY = yPosition + cardPaddingY + sectionTitleGap + lineHeight;
    cbts.forEach((cbt, i) => {
      const lines = pdf.splitTextToSize(`• ${cbt}`, contentWidth - cardPaddingX * 2 - 4);
      lines.forEach((line: string, j: number) => {
        pdf.text(line, margin + cardPaddingX + 2, cbtLineY);
        cbtLineY += lineHeight;
      });
      if (i < cbts.length - 1) cbtLineY += listGap;
    });
    yPosition += cbtCardHeight + cardSpacing;

    // 하단 따뜻한 메시지
    pdf.setFontSize(11);
    pdf.setTextColor(124, 58, 237);
    pdf.text('BeMore는 여러분의 마음을 항상 응원합니다 💜', pageWidth / 2, pageHeight - 16, { align: 'center' });

    // PDF 저장
    const fileName = `BeMore_리포트_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
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