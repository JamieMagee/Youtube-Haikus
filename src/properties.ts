export class Properties {
  readonly props: GoogleAppsScript.Properties.Properties;
  constructor() {
    this.props = PropertiesService.getScriptProperties();
  }

  get redditUsername(): string {
    return this.props.getProperty('REDDIT_USERNAME');
  }

  get redditPassword(): string {
    return this.props.getProperty('REDDIT_PASSWORD');
  }

  get redditClientId(): string {
    return this.props.getProperty('REDDIT_CLIENT_ID');
  }

  get redditClientSecret(): string {
    return this.props.getProperty('REDDIT_CLIENT_SECRET');
  }
}
