export interface Board {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
