const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  // Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ "social.googleId": profile.id });
          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email: profile.emails?.[0]?.value,
              social: { googleId: profile.id },
              profileImage: profile.photos?.[0]?.value,
            });
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // LinkedIn
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/linkedin/callback`,
        scope: ["r_emailaddress", "r_liteprofile"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ "social.linkedInId": profile.id });
          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email: profile.emails?.[0]?.value,
              social: { linkedInId: profile.id },
            });
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};
