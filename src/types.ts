export type DetalheExtrato = {
    valor: number,
    data: string,
    descricao: string
}


export type Conta = {
    nome: string,
    cpf: string,
    dataNascimento: string,
    saldo: number,
    extrato: DetalheExtrato[]    
}
