const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  toUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  offerSkill: { 
    type: String, 
    required: true 
},
  wantSkill: { 
    type: String, 
    required: true 
},
  status: { 
    type: String, 
    enum: ["PENDING", "ACCEPTED", "DECLINED"], 
    default: "PENDING" 
},
}, { timestamps: true });

module.exports = mongoose.model("Request", RequestSchema);
