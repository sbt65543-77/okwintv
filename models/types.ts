export interface JWT {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  name?: string;
  photoUrl?: string;
  phone?: string;
  role: string;
  username?: string;
}
