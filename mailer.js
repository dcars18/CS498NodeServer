'use strict';
const nodemailer = require('nodemailer');

/* 
*  Get the app info here because I don't want this to be on GitHub
*  Ask Dave for this information and don't upload the file to GitHub...
*  I will deny your pull request if you have this info in your directory.
*/
var fs = require('fs');
var gmailAppInfo = fs.readFileSync('GmailAppInfo.txt', 'utf8');
gmailAppInfo = gmailAppInfo.split('\n');
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: gmailAppInfo[0].toString(),
		pass: gmailAppInfo[1].toString()
	}
});

// setup email data with unicode symbols
let mailOptions = {
	from: '"🐟 Grouper Notifications 🐟" <GrouperNotifications@gmail.com>', // sender address
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
	},
	sendAddUserNotification: function(eventObj, addObj){

		mailOptions.to = eventObj[0].eventCreator
		console.log(mailOptions.to);
		mailOptions.subject = "New Person Coming To Your Event!!"
		mailOptions.text = "Hello Grouper User!\n "+addObj.name+" was added to your event:"+eventObj[0].eventName+
		" on "+addObj.eventDate+". To get in contact with them to make a plan you can email them at: "+addObj.email+
		"! \n\n Thank You, \n\t Grouper Notifications"
		mailOptions.html = '<b>Hello Grouper User!</b><br><br>' +addObj.name+" was added to your event:\'"+eventObj[0].eventName+
		"\' on "+addObj.eventDate+". To get in contact with them send them an email at: "+addObj.email+
		"! <br><br> Thank You,<br>Grouper Notifications"
		transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message %s sent: %s', info.messageId, info.response);
	});
	}
};