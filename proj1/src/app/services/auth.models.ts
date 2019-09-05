export class LoginDetails {
  username: string;
  password: string;
}

export class RegisterDetails {
  username: string;
  password: string;
  email: string;
}

export class User {
    _id?: string;
    username: string;
    isAdmin: boolean;
}
