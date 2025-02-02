const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
    Name: { 
        type: String, 
        required: true,
        trim: true
    },
    Amount: { 
        type: Number, 
        required: true,
        min: 0
    },
    Date: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(date) {
                const currentDate = new Date();
                return date.getMonth() === currentDate.getMonth() &&
                       date.getFullYear() === currentDate.getFullYear();
            },
            message: 'Date must be within the current month'
        }
    },
    Verified: { 
        type: String, 
        enum: ["Yes", "No"], 
        required: true 
    },
    sheetName: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true
});

DataSchema.index({ sheetName: 1, Date: 1 });

const DataModel = mongoose.model("ExcelData", DataSchema);

module.exports = DataModel;