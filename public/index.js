const Internationalization = {
  fr: './i18n/fr.json',
  en: './i18n/en.json',
};

const getAvailabilities = async () => {
  let res = await fetch('./availabilities.json');
  res = await res.json();
  return res;
};

// Use Internationalization for lang
// e.g. Internationalization.fr for French
const getInternationalization = async (lang) => {
  let res = await fetch(lang);
  res = await res.json();
  return res;
};

const convertTime = (seconds) => {
  let hour = Math.floor(seconds / 60 / 60);
  let min = Math.floor((seconds % (60 * 60)) / 60);
  if (min < 10) min = '0' + min;
  return {
    hour,
    min,
  };
};

// getAvailabilities().then((res) => console.log(res));

const injectAvailabilities = async () => {
  const availabilities = (await getAvailabilities()).availabilities;
  const internationalization = await getInternationalization(
    Internationalization.fr
  );

  const labels = availabilities.map((x) => {
    let label = x.label;
    if (internationalization[label]) label = internationalization[label];
    return `<div class="label">${label}</div>`;
  });

  let hasDoubleInterval = false;
  for (let i = 0; i < availabilities.length; i++) {
    if (availabilities[i].from2) {
      hasDoubleInterval = true;
      break;
    }
  }

  const hours = availabilities.map((x) => {
    if (x.closed) return `<div class="closed block">Fermé</div>`;
    let singleInterval = true;

    const from1Time = convertTime(x.from1);
    const to1Time = convertTime(x.to1);
    let time = '';
    if (x.from2) {
      singleInterval = false;
      const from2Time = convertTime(x.from2);
      const to2Time = convertTime(x.to2);
      time += `
      <span class="between">&</span>
      <div class="time_block block second">${from2Time.hour}:${from2Time.min}</div>
      <span class="between">-</span>
      <div class="time_block block second">${to2Time.hour}:${to2Time.min}</div>
      `;
    }

    time = `
    <div class="block ${
      singleInterval && hasDoubleInterval ? 'single' : 'time_block'
    }">${from1Time.hour}:${from1Time.min}</div>
    <span class="between">-</span>
    <div class="block ${
      singleInterval && hasDoubleInterval ? 'single' : 'time_block'
    }">${to1Time.hour}:${to1Time.min}</div>
    ${time}
    `;

    return `<div class="time">${time}</div>`;
  });

  $('#opening').append(internationalization.business_hours);
  $('#label_list').append(labels);
  $('#time_list').append(hours);
  $('.single').width($('.second').width());
  $('.label').height($('.block').height());
};

$(window).resize(() => {
  $('.single').width($('.second').width());
});

injectAvailabilities();
