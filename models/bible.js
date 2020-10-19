var mongoose = require("mongoose");

var BibleSchema = new mongoose.Schema({
	header: String,
	body: String,
	imageUrl: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

module.exports = mongoose.model("Bible", BibleSchema);