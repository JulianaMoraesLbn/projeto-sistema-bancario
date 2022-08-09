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

//retorna todas as contas
app.get('/contas', (req: Request, res: Response) => {
    try {

        if (!contas) { throw erros }

        res.status(sucesso.SUCESSO.status).send(contas)
    }
    catch (error: any) {
        res.status(erros.ERRO.status).send(erros.ERRO.message)

    }
})

//retorna o saldo
app.get('/contas/cliente', (req: Request, res: Response) => {

    try {
        const { cpf } = req.query

        if (!cpf) { throw erros.NAO_ENCONTRADO }

        const contaUser = contas.find(conta => conta.cpf === cpf)

        if (!contaUser) {
            throw erros.NAO_ENCONTRADO 
        }

        res.status(sucesso.SUCESSO.status).send({ saldo: contaUser.saldo })

    } catch (error: any) {
        res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
    }
})

//criar conta nova -ok
app.post('/contas', (req: Request, res: Response) => {

    try {

        const { nome, cpf, dataNascimento, saldo, extrato } = req.body

        if (!nome || !cpf || !dataNascimento || !saldo || !extrato) {
            throw erros.DADOS_AUSENTES
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
        res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
    }

})

//Adiciona Saldo
app.post('/contas/deposito', (req: Request, res: Response) => {

    try {

        const { cpf, saldo } = req.body

        if (!cpf || !saldo) {
            throw erros.DADOS_AUSENTES
        }

        contas.forEach((cadaConta) => {

            if (cadaConta.cpf === cpf) {
                cadaConta.saldo = cadaConta.saldo + saldo
                return res.status(successCode).send({ message: 'Deposito realizado com Sucesso' })
            }
        })

    } catch (error: any) {
        res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
    }
})

//realizar pagamento
app.post('/contas/cliente/pagamentos', (req: Request<{}, {}, { cpf: string, valor: number, data: any, descricao: string }>, res: Response) => {
    try {

        const { cpf, valor, data, descricao } = req.body

        if (!cpf || !valor || !data || !descricao) {
            throw erros.DADOS_AUSENTES
        }

        const novaData = (data as string).split('/')
        const dia = Number(novaData[0])
        const mes = Number(novaData[1])
        const ano = Number(novaData[2])


        contas.forEach((cadaConta) => {

            //posso fazer dessa forma pois o throw interrompe a execução do código.

            if (cadaConta.cpf !== cpf) {
                throw erros.NAO_ENCONTRADO
            }

            if (cadaConta.saldo < valor) {
                throw erros.ERRO
            }

            if (!(ano === anoAtual && mes >= mesAtual && dia >= diaAtual || data === isNaN || data === undefined)) {
                throw erros.DADOS_AUSENTES
            }

            cadaConta.saldo -= valor
            const newExtrato = {
                valor,
                data,
                descricao
            }
            cadaConta.extrato.push(newExtrato)

            res.status(sucesso.SUCESSO.status).send(newExtrato)
        })

    } catch (error: any) {
        switch (error.message) {
            case erros.NAO_ENCONTRADO.message:
                res.status(erros.NAO_ENCONTRADO.status).send(erros.NAO_ENCONTRADO.message)
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

        if (!cpfDestinatario || !nomeDestinatario || !cpfRemetente || !nomeRemetente || !valor) {
            throw erros.DADOS_AUSENTES
        }

        let contaDestinatarioAlterada
        contas.forEach((cadaConta) => {

            if (cadaConta.cpf === cpfRemetente && cadaConta.saldo >= valor) {
                contas.forEach((contaDestinatario) => {
                    if (contaDestinatario.cpf === cpfDestinatario) {
                        cadaConta.saldo -= valor
                        contaDestinatario.saldo += valor
                        contaDestinatarioAlterada = contaDestinatario.cpf
                    }
                })
            }
        })

        res.status(sucesso.SUCESSO.status).send(contaDestinatarioAlterada)

    } catch (error: any) {
        res.status(erros.DADOS_AUSENTES.status).send(erros.DADOS_AUSENTES.message)
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