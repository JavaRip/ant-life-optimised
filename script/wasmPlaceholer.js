async function greetJs(input) {
    console.log(`input: ${input}, type: ${typeof input}`);
    console.log(await GREET(input));
}