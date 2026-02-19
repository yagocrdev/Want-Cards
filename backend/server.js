const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/api/preco", async (req, res) => {

    const nomeCarta = req.query.nome;

    if (!nomeCarta) {
        return res.json({ preco: "Carta não informada" });
    }

    try {

        // Buscar todas versões físicas
        const response = await axios.get(
            "https://api.scryfall.com/cards/search",
            {
                params: {
                    q: `${nomeCarta} game:paper`
                }
            }
        );

        const cartas = response.data.data;

        let menorUSD = null;

        for (let carta of cartas) {
            if (carta.prices?.usd) {
                const preco = parseFloat(carta.prices.usd);

                if (!isNaN(preco)) {
                    if (menorUSD === null || preco < menorUSD) {
                        menorUSD = preco;
                    }
                }
            }
        }

        if (menorUSD === null) {
            return res.json({ preco: "Preço indisponível" });
        }

        // Cotação atual dólar
        const cotacao = await axios.get(
            "https://economia.awesomeapi.com.br/json/last/USD-BRL"
        );

        const dolar = parseFloat(cotacao.data.USDBRL.bid);

        const precoBRL = menorUSD * dolar;

        res.json({
            preco: `R$ ${precoBRL.toFixed(2)}`
        });

    } catch (error) {
        console.log("ERRO:", error.response?.data || error.message);
        res.json({ preco: "Erro ao buscar preço" });
    }

});

app.listen(3000, () => {
    console.log("🔥 Backend rodando em http://localhost:3000");
});
