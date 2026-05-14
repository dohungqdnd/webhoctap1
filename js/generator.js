(function(){
  function random(min,max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr){ return arr[random(0, arr.length - 1)]; }

  function generateQuestion(lesson){
    const min = lesson.min ?? 0;
    const max = lesson.max ?? 20;
    const tables = lesson.tables || [2,3,4,5];
    let a,b,c,answer,symbol,text,skill;

    if(lesson.type === 'add'){
      a = random(min, max);
      b = random(min, Math.max(min, max - a));
      answer = a + b; text = `${a} + ${b}`; skill = 'Cộng';
    }
    else if(lesson.type === 'sub'){
      a = random(min, max);
      b = random(min, a);
      answer = a - b; text = `${a} - ${b}`; skill = 'Trừ';
    }
    else if(lesson.type === 'mul'){
      a = pick(tables); b = random(1,10);
      answer = a * b; text = `${a} × ${b}`; skill = 'Nhân';
    }
    else if(lesson.type === 'div'){
      b = pick(tables); answer = random(1,10); a = b * answer;
      text = `${a} : ${b}`; skill = 'Chia';
    }
    else if(lesson.type === 'mixed_add_sub'){
      // 2 bước, không âm: a + b - c
      a = random(1, Math.min(max, 60));
      b = random(1, Math.min(30, max));
      c = random(0, Math.min(a + b, 30));
      answer = a + b - c;
      text = `${a} + ${b} - ${c}`;
      skill = 'Cộng + Trừ';
    }
    else if(lesson.type === 'mixed_mul_div'){
      // 2 bước, chia hết: a × b : c, trong đó c là một thừa số
      b = pick(tables);
      c = random(1, 5);
      answer = random(1, 10);
      a = answer * c;
      text = `${a} × ${b} : ${c}`;
      answer = a * b / c;
      skill = 'Nhân + Chia';
    }
    else if(lesson.type === 'mixed_all'){
      // Tổng hợp lớp 3: chỉ 2 bước để bé không quá tải, đảm bảo kết quả nguyên và không âm.
      const mode = pick(['mul_add', 'mul_sub', 'div_add', 'div_sub', 'add_sub']);
      if(mode === 'mul_add'){
        a = pick(tables); b = random(1,10); c = random(1,20);
        answer = a * b + c; text = `${a} × ${b} + ${c}`; skill = 'Nhân + Cộng';
      } else if(mode === 'mul_sub'){
        a = pick(tables); b = random(2,10); c = random(1, Math.max(1, a*b));
        answer = a * b - c; text = `${a} × ${b} - ${c}`; skill = 'Nhân + Trừ';
      } else if(mode === 'div_add'){
        b = pick(tables); answer = random(1,10); a = b * answer; c = random(1,20);
        text = `${a} : ${b} + ${c}`; answer = answer + c; skill = 'Chia + Cộng';
      } else if(mode === 'div_sub'){
        b = pick(tables); answer = random(3,10); a = b * answer; c = random(1, answer);
        text = `${a} : ${b} - ${c}`; answer = answer - c; skill = 'Chia + Trừ';
      } else {
        a = random(10, max); b = random(1,30); c = random(1, Math.min(a + b, 40));
        answer = a + b - c; text = `${a} + ${b} - ${c}`; skill = 'Cộng + Trừ';
      }
    }

    return { text, answer, skill };
  }

  function makeChoices(answer){
    const choices = new Set([answer]);
    const spread = answer <= 20 ? 4 : Math.max(8, Math.round(Math.abs(answer) * 0.12));
    let guard = 0;
    while(choices.size < 4 && guard < 100){
      guard++;
      const n = answer + random(-spread, spread);
      if(n >= 0) choices.add(n);
    }
    while(choices.size < 4){ choices.add(Math.max(0, answer + choices.size + 1)); }
    return [...choices].sort(() => Math.random() - 0.5);
  }

  window.QuestionGenerator = { generateQuestion, makeChoices };
})();
