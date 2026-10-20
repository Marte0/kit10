# Kit 10 · Bozza interattiva

Apri `index.html` in un browser. La bozza funziona anche senza connessione: font, dati e illustrazioni sono locali. Non servono installazioni, build o librerie esterne. Il collegamento alle fonti UFE richiede internet.

HTML, CSS e JavaScript nativi, con grafici e icone in SVG. Nessun utilizzo di Sites.

## Cosa provare

- Passa tra “Chi consuma?” e “Come cambia?”.
- Esplora la panoramica, Industria e costruzioni, Servizi.
- Seleziona una famiglia dall’anello o dalle schede; torna alla panoramica con il pulsante sopra il grafico.
- Cambia anno con lo slider (anche con le frecce della tastiera) o il tasto di riproduzione.
- Nella vista temporale seleziona fino a tre gruppi e confronta consumi o variazione dal 2002. Il cursore sul grafico consente di leggere i singoli anni.
- Metodo e fonti sono documentati in questo README.

## Dati e metodo della bozza

Fonti: Ufficio federale dell’energia, tabelle `12231-Publikationstabellen_DE_FR_IT_1999_bis_2013.xlsx` e `8788-Publikationstabellen_DE_FR_IT_2013_bis_2025.xlsx`, edizione luglio 2026.

https://pubdb.bfe.admin.ch/it/sammlungen/energiestatistik-energieverbrauch-in-der-industrie-und-im-dienstleistungssektor

Periodo: 2002–2025, 24 anni, 19 rami (12 industria/costruzioni, 7 servizi). Sono inclusi sei vettori: elettricità, gas naturale, olio extraleggero, olio medio/denso, rifiuti industriali e carbone. Esclusi legna e teleriscaldamento, che sono dichiarati incompleti nei file. Le quantità mostrate non sono quindi un totale esaustivo di tutte le forme di energia. Nessun dato mancante è trasformato in zero.

Per ogni ramo e vettore si calcola `fattore = valore 2013 recente / valore 2013 storico`. I valori 2002–2012 sono moltiplicati per questo fattore. Dal 2013 al 2025 si usano i valori del file recente. Quando entrambi i valori del 2013 sono zero il fattore è 1. La proporzione tra i rami negli anni storici può cambiare: ciascun ramo ha il proprio fattore. I fattori sono conservati in `data.js`, insieme ai nomi delle fonti.

Si tratta di una ricostruzione divulgativa, non di una serie ufficiale omogeneizzata. Il raccordo rimuove il cambio di base del 2013 ma non garantisce l’eliminazione di tutti gli altri effetti metodologici nel tempo. Per esempio, dal 2008 i codici NOGA 49, 50 e 51 dei trasporti sono esclusi dall’estrapolazione dei servizi. Nessuna levigatura o interpolazione viene applicata agli andamenti annuali. L’anello interpola solo la transizione visiva tra due anni selezionati, senza cambiare i dati.

Le categorie sono accorpamenti editoriali costanti nel tempo, definiti in `main.js`. Le quote sono calcolate rispetto all’ambito selezionato. I valori usati per i calcoli mantengono precisione; la visualizzazione è arrotondata. Le curve mostrano segmenti tra osservazioni annuali; i colori dei gruppi rimangono costanti nelle due viste.

## Da definire dopo il riscontro

Accorpamenti e nomi finali, illustrazioni definitive, eventuale approfondimento di singoli rami, trattamento editoriale delle variazioni nel tempo. Le icone attuali sono segnaposto vettoriali.

## Raggio del donut

L’area colorata dell’anello è proporzionale al consumo annuale, con foro interno fisso. La scala è calcolata sul massimo 2002–2025 dell’ambito selezionato (Panoramica, Industria e costruzioni, Servizi): il raggio confronta gli anni nello stesso ambito, non le dimensioni di ambiti diversi. Le transizioni animano insieme proporzioni e raggio. Il centro mostra il valore completo in TJ, con separatore delle migliaia apostrofo.
