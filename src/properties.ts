export class Properties {
  readonly props: GoogleAppsScript.Properties.Properties;
  constructor() {
    this.props = PropertiesService.getScriptProperties();
  }

  get redditClientId(): string {
    return this.props.getProperty('REDDIT_CLIENT_ID');
  }

  get redditClientSecret(): string {
    return this.props.getProperty('REDDIT_CLIENT_SECRET');
  }
}
