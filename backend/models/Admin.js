const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	partener: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	pass: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	regDate: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("admins", AdminSchema);
