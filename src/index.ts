import express, { Request, Response } from 'express'
import cors from 'cors'
import { AddressInfo } from 'net'
import { contas } from './contas'
import { Conta } from './types'

const app = express()
app.use(express.json())
app.use(cors())

const errorCode: number = 400
const successCode: number = 200

const dataAtual = new Date
const anoAtual = dataAtual.getFullYear()
console.log(anoAtual)
const mesAtual = dataAtual.getMonth() + 1
const diaAtual = dataAtual.getDay() + 1


const erros = {
    CREDENCIAIS_INVALIDAS: { status: 401, message: "Verificar as credenciais" },
    NAO_ENCONTRADO: { status: 404, message: "Não encontrado" },
    CONTA_EXISTENTE: { status: 404, message: "Esta conta já existe" },
    DADOS_AUSENTES: { status: 422, message: "Faltam informações, por favor, verificar." },
    ERRO: { status: 500, message: "Falha. Algo deu errado" }
}

const sucesso = {
    SUCESSO: { status: 200, message: "Realizado com sucesso!" },
    CRIADO_SUCESSO: { status: 201, message: "Conta criado com sucesso!" },
}

app.get('/contas', (req: Request, res: Response) => {
    try{

        if(!contas){
            throw new Error(erros.ERRO.message)
        }
        const allContas = contas.map(conta => conta)
        res.status(sucesso.SUCESSO.status).send(allContas)
    }
    catch(error: any){
        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }
})

//retorna o saldo
app.get('/contas/cliente', (req: Request, res: Response) => {

    try {
        const { cpf } = req.query

        if (!cpf) { throw new Error(erros.NAO_ENCONTRADO.message) }

        const contaUser = contas.find(conta => conta.cpf === cpf)
        

        if (!contaUser) {

            throw new Error(erros.NAO_ENCONTRADO.message)
        }
    

        res.status(sucesso.SUCESSO.status).send({ saldo: contaUser.saldo })

    } catch (error: any) {

        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }
})

//criar conta nova -ok
app.post('/contas', (req: Request, res: Response) => {

    try {

        const { nome, cpf, dataNascimento, saldo, extrato } = req.body

        if (!nome || !cpf || !dataNascimento || !saldo || !extrato) {
            throw new Error(erros.DADOS_AUSENTES.message)
        }

        const novaConta: Conta = {
            nome,
            cpf,
            dataNascimento,
            saldo,
            extrato
        }

        console.log(novaConta)

        contas.push(novaConta)
        res.status(sucesso.CRIADO_SUCESSO.status).send(sucesso.CRIADO_SUCESSO.message)

    } catch (error: any) {
        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }

})

//Adiciona Saldo
app.post('/contas/deposito', (req: Request, res: Response) => {

    try {

        const { cpf, saldo } = req.body

        if (!cpf || !saldo) {
            throw new Error(erros.DADOS_AUSENTES.message)
        }

        contas.forEach((cadaConta) => {

            if (cadaConta.cpf === cpf) {
                cadaConta.saldo = cadaConta.saldo + saldo
                return res.status(successCode).send({ message: 'Deposito realizado com Sucesso' })
            }
        })


    } catch (error: any) {
        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }
})

//realizar pagamento
app.post('/contas/cliente/pagamentos', (req: Request<{}, {}, { cpf: string, valor: number, data: any, descricao: string }>, res: Response) => {
    try {

        const { cpf, valor, data, descricao } = req.body

        if (!cpf || !valor || !data || !descricao) {
            throw new Error(erros.DADOS_AUSENTES.message)
        }

        const novaData = (data as string).split('/')
        const dia = Number(novaData[0])
        const mes: number = Number(novaData[1])
        const ano: number = Number(novaData[2])

        let newExtrato
        contas.forEach((cadaConta) => {

            if (cadaConta.cpf === cpf) {
                if (cadaConta.saldo >= valor) {
                    if (ano === anoAtual && mes >= mesAtual && dia >= diaAtual || data === isNaN || data === undefined) {
                        cadaConta.saldo -= valor
                        newExtrato = {
                            valor,
                            data,
                            descricao
                        }
                        cadaConta.extrato.push(newExtrato)
                        return newExtrato
                    }
                    throw new Error(erros.DADOS_AUSENTES.message) //data de pagamento não autorizada
                }
                throw new Error(erros.ERRO.message) //'Saldo insuficiente'
            }
            throw new Error(erros.NAO_ENCONTRADO.message) //'Conta não localizada' 
        })

        res.status(sucesso.SUCESSO.status).send(newExtrato)


    } catch (error: any) {
        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }
})

//transferencia
app.post('/contas/transferencia', (req: Request, res: Response) => {

    try {

        const { cpfDestinatario, nomeDestinatario, cpfRemetente, nomeRemetente, valor } = req.body

        if(!cpfDestinatario || !nomeDestinatario || !cpfRemetente || !nomeRemetente || !valor){
            throw new Error(erros.DADOS_AUSENTES.message)
        }
        
        let contaDestinatarioAlterada
        contas.forEach((cadaConta) => {
            
            if (cadaConta.cpf === cpfRemetente && cadaConta.saldo >= valor) {
                
                contas.forEach((contaDestinatario) => {
                    if (contaDestinatario.cpf === cpfDestinatario) {
                        cadaConta.saldo -= valor
                        contaDestinatario.saldo += valor

                        contaDestinatarioAlterada = contaDestinatario.cpf
                        return contaDestinatarioAlterada
                    }
                })
            }
        })

        res.status(sucesso.SUCESSO.status).send(contaDestinatarioAlterada)

    } catch (error: any) {
        switch (error.message) {
            case erros.CREDENCIAIS_INVALIDAS.message:
                res.status(erros.CREDENCIAIS_INVALIDAS.status).send(erros.CREDENCIAIS_INVALIDAS.message)
                break;
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
                break;
            case erros.CONTA_EXISTENTE.message:
                res.status(erros.CONTA_EXISTENTE.status).send(erros.CONTA_EXISTENTE.message)
                break;
            case erros.DADOS_AUSENTES.message:
                res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
                break;
            default:
                res.status(erros.ERRO.status).send(erros.ERRO.message)
        }
    }
})

//colocar servidor de pé
const server = app.listen(process.env.PORT || 3003, () => {

    if (server) {
        const address = server.address() as AddressInfo
        console.log(`Servidor rodando na porta http://localhost: ${address.port}`)
    } else {
        console.error(`Falha na inicialização do servidor`)
    }

})