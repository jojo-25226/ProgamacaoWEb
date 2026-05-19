import React, { useEffect } from 'react';
import './index.css';

export function CriarConta() {
  useEffect(() => {
    const diaSelect = document.getElementById('day') as HTMLSelectElement;
    const mesSelect = document.getElementById('month') as HTMLSelectElement;
    const anoSelect = document.getElementById('year') as HTMLSelectElement;

    if (diaSelect && mesSelect && anoSelect) {
      diaSelect.innerHTML = '<option value="">Dia</option>';
      for (let i = 1; i <= 31; i++)
        diaSelect.innerHTML += `<option>${i}</option>`;

      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      mesSelect.innerHTML = '<option value="">Mês</option>';
      meses.forEach((mes, i) =>
        mesSelect.innerHTML += `<option value="${i + 1}">${mes}</option>`);

      const anoAtual = new Date().getFullYear();
      anoSelect.innerHTML = '<option value="">Ano</option>';
      for (let i = anoAtual; i >= 1905; i--)
        anoSelect.innerHTML += `<option>${i}</option>`;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const senha = (document.getElementById('password') as HTMLInputElement).value;
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    alert('Conta criada com sucesso!');
  };

  return (
    <div className="signup-page">

      <div className="left-section">
        <h1 className="logo">Social NetWork</h1>
        <p className="subtitle">Conecta-te com amigos e o mundo à tua volta.</p>
      </div>

      <div className="right-section">
        <div className="card">
          <h3>Crie uma nova conta</h3>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <input type="text" placeholder="Nome" required />
              <input type="text" placeholder="Sobrenome" required />
            </div>

            <input type="email" placeholder="Número ou email" required />
            <input type="password" placeholder="Nova senha" id="password" required />

            <div className="field-group">
              <label className="field-label">Data de nascimento</label>
              <div className="row">
                <select id="day" required></select>
                <select id="month" required></select>
                <select id="year" required></select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Género</label>
              <div className="gender-row">
                <label className="gender-option">
                  <input type="radio" name="gender" required /> Feminino
                </label>
                <label className="gender-option">
                  <input type="radio" name="gender" /> Masculino
                </label>
                <label className="gender-option">
                  <input type="radio" name="gender" /> Outro
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit">Registra-se</button>

            <div className="login-link">
              <a href="#">Já tem uma conta?</a>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

export default CriarConta;