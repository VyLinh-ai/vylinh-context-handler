import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor() {
    console.log('alo: ', process.env.TWITTER_CALLBACK_URL)
    super({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
      includeEmail: true,
    });
  }

  async validate(token: string, tokenSecret: string, profile: any) {
    // Handle user profile and tokens here
    return { profile, token, tokenSecret };
  }
}
