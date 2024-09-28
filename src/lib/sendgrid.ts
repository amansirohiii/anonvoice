import sgMail from '@sendgrid/mail';
export const sgmail = sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);