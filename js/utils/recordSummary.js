export function formatRecordSummary(formData) {
  const parts = [
    `№ ${formData.get('number')}`,
    `УКО ${formData.get('uko')}`,
    `Договор ${formData.get('contract')}`,
    `Назначение ${formData.get('purpose')}`,
    `Дата ${formData.get('year')}`,
    `КС-3 ${formData.get('ks3')}`,
    `Мероприятие ${formData.get('eventName')}`,
    `Адрес ${formData.get('address')}`,
    `Стоимость ${formData.get('contractorCost')}`
  ];

  return parts.join(' | ');
}
