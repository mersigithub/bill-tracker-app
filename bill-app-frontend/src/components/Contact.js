import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const ContactForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
  
    const formData = new FormData(form.current);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
  
    emailjs.send(
      'service_fyumgu7',
      'template_8tmnmhf',
      {
        name,
        email,
        message,
        reply_to: email, 
      },
      'hikuv1HQ3PvfJ5pgb'
    )
    .then((result) => {
      console.log('Message sent successfully:', result.text);
      alert('Message sent!');
      form.current.reset();
    })
    .catch((error) => {
      console.error('Error sending message:', error.text);
      alert('Message failed to send.');
    });
  };  

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form ref={form} onSubmit={sendEmail} className="contact-form">
        <input type="text" name="name" placeholder="Your Name" required />
        <input type="email" name="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message" required />
        <button type="submit" className="submit-button">Send Message</button>
      </form>
    </div>
  );
};

export default ContactForm;