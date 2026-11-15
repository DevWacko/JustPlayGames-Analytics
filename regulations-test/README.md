# T&T Regulations Test Trainer

A static website for practising the Trinidad and Tobago driver's regulations
(written) test. Open `index.html` in any browser; no build step or server needed.

- 9 categories: rules of the road, traffic signs, road markings & traffic lights,
  hand & police signals, speed/alcohol/phones, parking, pedestrians & road users,
  permits/plates/documents, emergencies & vehicle care.
- Multiple-choice quizzes with instant right/wrong feedback and an explanation.
- Mock test (25 random questions), "review my mistakes", and a study list per category.
- Signs, markings and hand signals are drawn as SVG in `signs.js`.

## Adding questions from the official booklet

Edit `questions.js` and add an entry. The first option is always the correct one;
options are shuffled on screen.

```js
{ c: "signs", q: "What does this sign mean?", o: ["Correct", "Wrong", "Wrong", "Wrong"],
  e: "Optional explanation", img: "stop" }
```

The questions are based on the T&T Highway Code and the Motor Vehicles and Road
Traffic Act. Always confirm answers against the official study guide sold by the
Licensing Division.
