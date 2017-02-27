'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'groupernotification@gmail.com',
		pass: 'Grouper01'
	}
});

// setup email data with unicode symbols
let mailOptions = {
	from: '"Grouper Notifications 👻" <GrouperNotifications@gmail.com>', // sender address
	to: 'deca222@g.uky.edu', // list of receivers
	subject: 'Hello ✔', // Subject line
	text: 'Hello world ?', // plain text body
	html: '<b>Hello world ?</b>' // html body
};


module.exports = {
	// send mail with defined transport object
	sendMail: function(emailAddress){
		mailOptions.to = emailAddress;
		transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message %s sent: %s', info.messageId, info.response);
	})},
	tester: function(emailAddress){
		mailOptions.to = emailAddress;
		console.log(mailOptions.to);
	}
};