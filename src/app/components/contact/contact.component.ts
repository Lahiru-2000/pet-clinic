import { Component } from '@angular/core';
import { ContactService } from '../../service/contact/contact.service';
import { ContactMessage } from '../../models/contact-message.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contact: ContactMessage = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private contactService: ContactService) {}

  onSubmit() {
    this.contactService.sendMessage(this.contact).subscribe({
      next: (response: any) => {
        console.log('Message sent:', response);
        alert('Message sent successfully!');
      },
      error: (err: any) => {
        console.error('Error sending message:', err);
        alert('Something went wrong!');
      }
    });
  }
}

