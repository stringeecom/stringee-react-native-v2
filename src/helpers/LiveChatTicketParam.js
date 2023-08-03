class LiveChatTicketParam {
  name: string;
  email: string;
  phone: string;
  note: string;

  constructor(props: {
    name: string,
    email: string,
    phone: string,
    note: string,
  }) {
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.note = props.note;
  }
}

export default LiveChatTicketParam;
