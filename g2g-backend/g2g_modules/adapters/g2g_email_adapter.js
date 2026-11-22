/**
 * 
 */
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.office365.com',
    port: 587,
//    secure: true, // use SSL
    debug: true,
    auth: {
        user: 'ibrahim@g2gapp.net',
        pass: 'P@ssw0rd'
    }
}));

var sendEmail = function(to, from, subject, body) {
	transporter.sendMail({
	    from: from,
	    to: to,
	    subject: subject,
	    html: body
	}, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
    }});
};

exports.sendEmail = sendEmail;
