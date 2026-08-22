import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID || 'FACEBOOK_APP_ID',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET',
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        'http://localhost:3000/auth/facebook/callback',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails && emails[0] ? emails[0].value : '',
      fname: name?.givenName || '',
      lname: name?.familyName || '',
      avatarUrl: photos && photos[0] ? photos[0].value : '',
      provider: 'facebook',
    };
    done(null, user);
  }
}
