const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');


// models import
const Event = require('../../models/event');
const User = require('../../models/user');
const Profile = require('../../models/profile');

const router = express.Router();

// to register a new user
router.post('/register', (req, res) => {
   User.findOne({email: req.body.email}).then((result) => {
      if (!result){
         const new_User = new User({
            name: req.body.name,
            email : req.body.email,
            password: req.body.password,
            acc_type : req.body.acc_type
         })

         bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(new_User.password, salt, (err, hash) => {
               if (err) throw err;
               new_User.password = hash;
               new_User.save().then((result) => {
                  res.json(result)
               }).catch((err) => {console.log(err)})
            })
         })
      } // if condition ends
      else{
         res.status(400).json({message : 'Email already exists'})
      }
   })
})

// to login a resgistered User
router.post('/login', (req, res) => {
   const email = req.body.email;
   const password = req.body.password;
   User.findOne({email}).then((result) => {
      if(!result){
         return res.status(404).json({message : 'email not found'})
      }
      bcrypt.compare(password, result.password).then((match) => {
         if(match){
               const payload = {
                  id : result.id,
                  name : result.name,
                  email : result.email,
                  acc_type : result.acc_type
               } //jwt payload
               jwt.sign(payload, 'abcssss', { expiresIn: 3600}, (err, token) => {
                  res.json({success: true, token: 'Bearer ' + token });
               })
         }
         else{
            return res.status(400).json({message: 'incorrect password'})
         }
      })
   })
});


// to get the current user
router.get('/current', passport.authenticate('jwt', {session : false}),(req, res) => {
   //User.findOne({email : req.user.email}).then((result) => {console.log(result);})
   res.json(req.user);
});

//to logout a user
router.get('/logout', passport.authenticate('jwt', {session : false}), (req, res) => {
   res.json({message : 'destroy the token from header in frontend :P'})
})

//to delete a user and all its Data
router.delete('/current', passport.authenticate('jwt', {session : false}), (req, res) => {
   let message = {};

   if(req.user.acc_type === 'organiser'){
      Event.remove({user : req.user.id}).then((result) => {
         if(result){
            message.events = 'all events deleted';
         }else{
            message.events = 'unable to delete events';
         }
      }).catch((err) => console.log(err))
   }

   Profile.findOneAndRemove({user: req.user.id}).then((result) => {
      if(result){
         message.profile = 'profile deleted';
      }
      else{
         message.profile = 'cant find profile';
      }
   })
   
   User.findOneAndRemove({email : req.user.email}).then((result) => {
      if(result){
         message.user = 'user deleted successfully';
         res.json(message)
      }
      else{
         message.user = 'user not found';
         res.json(message)
      }
   }).catch((err) => console.log(err))
})

module.exports = router;
