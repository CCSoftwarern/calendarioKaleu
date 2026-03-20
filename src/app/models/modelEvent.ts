export class Evento {
  constructor(
    public id: string,
    public created_at: string,
    public title: string,
    public start: string, // ou Date
    public backgroundColor: string,
    public borderColor: string,
    public textColor: string,
    public nm_cliente: string,
    public nm_vendedor: string,
    public id_vendedor: number,
    public telefone_cliente: string,
    public email: string
  ) {}
}