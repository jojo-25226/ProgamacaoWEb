import React, {useState} from 'react';
import '../Componentes/index.css';
import {useNavigate} from "react-router-dom";

export function RegisterAndLogin() {
    const navigate = useNavigate();

    // Estado para controlar o modo de login/registo
    const [isLogin, setIsLogin] = useState(true);

    // Campos comuns
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Campos de registo
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [gender, setGender] = useState('');

    // Dados para os selects de data de nascimento
    const days = Array.from({length: 31}, (_, i) => i + 1);
    const months = [
        {value: 1, name: 'Janeiro'}, {value: 2, name: 'Fevereiro'},
        {value: 3, name: 'Março'}, {value: 4, name: 'Abril'},
        {value: 5, name: 'Maio'}, {value: 6, name: 'Junho'},
        {value: 7, name: 'Julho'}, {value: 8, name: 'Agosto'},
        {value: 9, name: 'Setembro'}, {value: 10, name: 'Outubro'},
        {value: 11, name: 'Novembro'}, {value: 12, name: 'Dezembro'}
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - 1905 + 1},
        (_, i) => currentYear - i);

    // Função de submissão ligada ao Backend
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isLogin && password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return;
        }

        const endpoint = isLogin ? '/login' : '/register';

        // Criação do objeto payload para envio ao backend
        const payload = isLogin
            ? {email, password}
            : {
                username: `${firstName} ${lastName}`.trim(),
                email,
                password,
                birthDate: `${year}-${month}-${day}`,
                gender,
            };

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    alert(`Bem-vindo, ${data.user.username}!`);

                    navigate("/");
                } else {
                    alert('Conta criada com sucesso! Já pode iniciar sessão.');
                    setIsLogin(true);
                }
            } else {
                // Mostra o erro real enviado pelo backend (ex: "Email já existe" ou erros de validação)
                alert(data.message || 'Algo correu mal.');
            }
        } catch
            (error) {
            console.error('Erro ao conectar ao backend:', error);
            alert('Não foi possível conectar com o servidor. Garante que o backend está ligado!');
        }
    }

    return (
        <div className="signup-page">
            <div className="left-section">
                <h1 className="logo">Social NetWork</h1>
                <p className="subtitle">Conecta-te com amigos e o mundo à tua volta.</p>
            </div>

            <div className="right-section">
                <div className="card">
                    <h3>{isLogin ? 'Iniciar Sessão' : 'Criar nova conta'}</h3>

                    <form onSubmit={handleSubmit}>
                        {/* CAMPOS DE LOGIN */}
                        {isLogin && (<>
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>)}

                        {!isLogin && (<>
                            <div className="row">
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Apelido"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="field-group">
                                <label className="field-label">Data de nascimento</label>
                                <div className="row">
                                    <select id="day" value={day} onChange={(e) => setDay(e.target.value)} required>
                                        <option value="">Dia</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>

                                    <select id="month" value={month} onChange={(e) => setMonth(e.target.value)}
                                            required>
                                        <option value="">Mês</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                    </select>

                                    <select id="year" value={year} onChange={(e) => setYear(e.target.value)}
                                            required>
                                        <option value="">Ano</option>
                                        {years.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="field-label">Género</label>
                                <div className="gender-row">
                                    <label className="gender-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            checked={gender === 'F'}
                                            onChange={(e) => setGender(e.target.value)}
                                            required
                                        /> Feminino
                                    </label>
                                    <label className="gender-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            checked={gender === 'M'}
                                            onChange={(e) => setGender(e.target.value)}
                                        /> Masculino
                                    </label>
                                    <label className="gender-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="N/D"
                                            checked={gender === 'N/D'}
                                            onChange={(e) => setGender(e.target.value)}
                                        /> Outro
                                    </label>
                                </div>
                            </div>
                        </>)}

                        <button type="submit" className="btn-submit">
                            {isLogin ? 'Entrar' : 'Registar'}
                        </button>

                        <div className="login-link">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ background: 'none', border: 'none', color: '#1877f2', cursor: 'pointer' }}
                            >
                                {isLogin ? 'Criar nova conta' : 'Já tem conta? Iniciar sessão'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

        </div>
    );
}

export default RegisterAndLogin;