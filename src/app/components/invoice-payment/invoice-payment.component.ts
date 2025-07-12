import { Component } from '@angular/core';

interface Invoice {
  id: number;
  date: string;
  amount: number;
  status: string;
  fileUrl: string;
}

@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss']
})
export class InvoicePaymentComponent {
  invoices: Invoice[] = [
    { id: 1, date: '2024-06-01', amount: 120.00, status: 'Paid', fileUrl: 'assets/invoices/invoice1.pdf' },
    { id: 2, date: '2024-06-10', amount: 80.50, status: 'Unpaid', fileUrl: 'assets/invoices/invoice2.pdf' },
    { id: 3, date: '2024-06-15', amount: 200.00, status: 'Paid', fileUrl: 'assets/invoices/invoice3.pdf' }
  ];

  downloadInvoice(invoice: Invoice) {
    // In a real app, this would trigger a download from the server
    window.open(invoice.fileUrl, '_blank');
  }
}
