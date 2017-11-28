var Hospital = require('../models/Hospital.js');

exports.hospitalLogin = function(req,res) {
    //passport.authenticate('local', function(err, user, info) {
        if(!req.body.email) {
            return res.status(400).send({message: 'Hospital not found'});
        }
        Hospital.find({email:req.body.email, password:req.body.password},(err, someHospital) => {
            if(err){
                res.send('Hospital not found');
            }
            if(!someHospital){
                res.json('Hospital not found');
            }
            res.status(200).send(someHospital);
        });
};

exports.create = function(req, res) {
    var hospital = new Hospital({name: req.body.name, userType:"Hospital", address: req.body.address, zip: req.body.zip, 
        phone: req.body.phone, email: req.body.email, password: req.body.password, chekUpDate: new Date(Date.now())});
    var promise = hospital.save();
    promise.then(function(hospital) {
        hospital.message = "Hospital successfully registered";
        res.status(200).send(hospital);
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({message: "Some error occurred while creating the hospital."});
    });
};

exports.findAll = function(req, res) {
    Hospital.find(function(err, hospitals){
        if(err) {
            res.status(500).send({message: "Some error occurred while retrieving hospitals info."});
        } else {
            res.send(hospitals);
        }
    });
}

exports.updateHospital = function(req, res) {
    if (req.params.hospitalId == null) {
        res.status(400).send({message : "no hospitalId passed"});
    }
    Hospital.findById(req.params.hospitalId, function(err, hospital) {
        hospital.chekUpDate = new Date(req.body.chekUpDate);
        hospital.save(function(err, result){
            if(err) {
                res.status(500).send({message: "Some error occurred while updating the hospital."});
            } else {
                res.send(result);
            }
        });
    });
};

exports.getHospitalsByZip = function(req, res) {
    let findzip = parseInt(req.params.zip);
    var hosps = [];
    Hospital.find({$or : [{"zip": {$gte:findzip-1, $lt:findzip+1 }},{"zip":{$gte:findzip-10, $lt:findzip+10 }},
        {"zip":{$gte:findzip-100, $lt:findzip+100 }}]}, (err, hospitals) => {
        if(err) {
            res.status(500).send({message: "Some error occurred while updating the hospital."});
        } else {
            hosps.push(hospitals);
            for (var i = hosps.length - 1; i >= 0; i--) {
                if(hosps[i].chekupdate){
                    var adjustedChekUpDate = updatedTime(hosps[i]);
                    hosps[i].chekUpDate = (new Date(adjustedChekUpDate)).toLocaleString();
                }
            }
            res.send(hosps);
        }
    });
};

var updatedTime = function(hospital) {
    return hospital.chekupdate.getTime()+(hospital.chekupdate.getHours()<9 ? ((9-hospital.chekupdate.getHours())*60*60*1000) : 0) +
        (hospital.chekupdate.getHours()>18 ? ((32-hospital.chekupdate.getHours())*60*60*1000) : 0) - hospital.chekupdate.getMinutes()*60*1000-
        hospital.chekupdate.getSeconds()*1000 - hospital.chekupdate.getMilliseconds() + + (hospital.chekupdate.getDay()==0? (24*60*60*1000):0) +
        (hospital.chekupdate.getDay()==6 ? (2*24*60*60*1000):0);
};

exports.updatedHospitalTime = function(date) {
    return date.getTime()+(date.getHours()<9 ? ((9-date.getHours())*60*60*1000) : 0) +
        (date.getHours()>18 ? ((32-date.getHours())*60*60*1000) : 0) - date.getMinutes()*60*1000-
        date.getSeconds()*1000 - date.getMilliseconds() + + (date.getDay()==0? (24*60*60*1000):0) +
        (date.getDay()==6 ? (2*24*60*60*1000):0);
};

exports.updateHospitalByEmail = (req, res) => {
    Hospital.findOneAndUpdate({email:req.params.email}, req.body, {new:true}, (err, someHospital) => {
        if(err){
          res.send(err);
        }
        res.json(someHospital);
      });
};