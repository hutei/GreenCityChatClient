export class ChatMessageDto {
  public id: number;
  public roomId: number;
  public content: string;
  public senderId: number;
  public status: string;
  public imageName: string;
  public fileType: string;
}
