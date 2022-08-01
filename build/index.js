"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const contas_1 = require("./contas");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const errorCode = 400;
const successCode = 200;
const dataAtual = new Date;
const anoAtual = dataAtual.getFullYear();
const mesAtual = dataAtual.getMonth() + 1;
const diaAtual = dataAtual.getDay() + 1;
app.get('/contas', (req, res) => {
    try {
        res.status(successCode).send(contas_1.contas);
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
app.get('/contas/cliente', (req, res) => {
    try {
        const { cpf } = req.body;
        contas_1.contas.forEach((cadaConta) => {
            if (cadaConta.cpf === cpf) {
                return res.status(successCode).send({ saldo: cadaConta.saldo });
            }
        });
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
app.post('/contas/criar', (req, res) => {
    try {
        const { nome, cpf, dataNascimento, saldo, extrato } = req.body;
        const novaConta = {
            nome,
            cpf,
            dataNascimento,
            saldo,
            extrato
        };
        contas_1.contas.push(novaConta);
        res.status(successCode).send('Cadastro concluido');
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
app.post('/contas/deposito', (req, res) => {
    try {
        const { cpf, saldo } = req.body;
        contas_1.contas.forEach((cadaConta) => {
            if (cadaConta.cpf === cpf) {
                cadaConta.saldo = cadaConta.saldo + saldo;
                return res.status(successCode).send({ message: 'Deposito realizado com Sucesso' });
            }
        });
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
app.post('/contas/cliente/pagamentos', (req, res) => {
    try {
        const { cpf, valor, data, descricao } = req.body;
        const novaData = data.split('/');
        const dia = Number(novaData[0]);
        const mes = Number(novaData[1]);
        const ano = Number(novaData[2]);
        contas_1.contas.forEach((cadaConta) => {
            if (cadaConta.cpf === cpf) {
                if (cadaConta.saldo >= valor) {
                    if (ano === anoAtual && mes >= mesAtual && dia >= diaAtual || data === isNaN || data === undefined) {
                        cadaConta.saldo -= valor;
                        const newExtrato = {
                            valor,
                            data,
                            descricao
                        };
                        cadaConta.extrato.push(newExtrato);
                        return res.status(successCode).send({ message: 'Pagamento realizado com sucesso', newExtrato });
                    }
                    return res.status(successCode).send({ message: 'Data de pagamento não autorizada' });
                }
                return res.status(successCode).send({ message: 'Saldo insuficiente' });
            }
            return res.status(successCode).send({ message: 'Conta não localizada' });
        });
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
app.post('/contas/transferencia', (req, res) => {
    try {
        const { cpfDestinatario, nomeDestinatario, cpfRemetente, nomeRemetente, valor } = req.body;
        console.log('dentro do try');
        contas_1.contas.forEach((cadaConta) => {
            console.log('entrou');
            if (cadaConta.cpf === cpfRemetente && cadaConta.saldo >= valor) {
                console.log('1 forEach', cadaConta.cpf);
                contas_1.contas.forEach((contaDestinatario) => {
                    console.log('2 forEach', contaDestinatario);
                    if (contaDestinatario.cpf === cpfDestinatario) {
                        cadaConta.saldo -= valor;
                        contaDestinatario.saldo += valor;
                        return res.status(successCode).send({ menssage: `Transferencia realizada com sucesso no valor de: ${valor} / Destinatário: ${nomeDestinatario} Remetente: ${nomeRemetente}` });
                    }
                });
            }
        });
    }
    catch (error) {
        res.status(errorCode).send(error);
    }
});
const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
        const address = server.address();
        console.log(`Servidor rodando na porta http://localhost: ${address.port}`);
    }
    else {
        console.error(`Falha na inicialização do servidor`);
    }
});
//# sourceMappingURL=index.js.map