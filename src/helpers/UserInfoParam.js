class UserInfoParam {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  location: string;
  browser: string;
  platform: string;
  device: string;
  ipAddress: string;
  hostName: string;
  userAgent: string;

  constructor(props: {
    name: string,
    email: string,
    avatar: string,
    phone: string,
    location: string,
    browser: string,
    platform: string,
    device: string,
    ipAddress: string,
    hostName: string,
    userAgent: string,
  }) {
    this.name = props.name;
    this.email = props.email;
    this.avatar = props.avatar;
    this.phone = props.phone;
    this.location = props.location;
    this.browser = props.browser;
    this.platform = props.platform;
    this.device = props.device;
    this.ipAddress = props.ipAddress;
    this.hostName = props.hostName;
    this.userAgent = props.userAgent;
  }
}

export default UserInfoParam;
