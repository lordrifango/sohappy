import React, { useState } from 'react';

// Liste des pays avec codes et drapeaux
const countries = [
  { code: '+33', name: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮', iso: 'CI' },
  { code: '+223', name: 'Mali', flag: '🇲🇱', iso: 'ML' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫', iso: 'BF' },
  { code: '+221', name: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { code: '+229', name: 'Bénin', flag: '🇧🇯', iso: 'BJ' },
  { code: '+228', name: 'Togo', flag: '🇹🇬', iso: 'TG' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', iso: 'GH' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+1', name: 'États-Unis', flag: '🇺🇸', iso: 'US' },
  { code: '+44', name: 'Royaume-Uni', flag: '🇬🇧', iso: 'GB' },
  { code: '+49', name: 'Allemagne', flag: '🇩🇪', iso: 'DE' },
  { code: '+39', name: 'Italie', flag: '🇮🇹', iso: 'IT' },
  { code: '+34', name: 'Espagne', flag: '🇪🇸', iso: 'ES' }
];

export const PhoneLoginScreen = ({ onCodeSent }) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[1]); // Côte d'Ivoire par défaut
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://ec8cf41e-fc2f-4f0b-a825-333abc61afac.preview.emergentagent.com';

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Veuillez saisir votre numéro de téléphone');
      return;
    }

    // Validation basique du numéro
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 8) {
      setError('Numéro de téléphone trop court');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log('Backend URL:', backendUrl);
    console.log('Sending request with data:', { phone: cleanPhone, country_code: selectedCountry.code });

    try {
      const response = await fetch(`${backendUrl}/api/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanPhone,
          country_code: selectedCountry.code
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        onCodeSent({
          phone: cleanPhone,
          countryCode: selectedCountry.code,
          sessionId: data.session_id
        });
      } else {
        setError(data.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      console.error('Send code error:', err);
      setError(`Erreur de connexion: ${err.message}. Veuillez réessayer.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-violet-600 mb-2">Tonty</h1>
          <p className="text-gray-600 text-lg">
            Atteignez vos objectifs ensemble, en toute confiance.
          </p>
        </div>

        {/* Phone Input Form */}
        <div className="space-y-6">
          {/* Country Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <button
              type="button"
              onClick={() => setShowCountryList(!showCountryList)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span className="text-gray-800">{selectedCountry.name}</span>
                <span className="text-gray-500">{selectedCountry.code}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Country Dropdown */}
            {showCountryList && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country.iso}
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryList(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-gray-800">{country.name}</span>
                    <span className="text-gray-500 ml-auto">{country.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex">
              <div className="flex items-center px-3 py-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl">
                <span className="text-gray-600 font-medium">{selectedCountry.code}</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Votre numéro"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Send Code Button */}
          <button
            onClick={handleSendCode}
            disabled={isLoading || !phoneNumber.trim()}
            className="w-full bg-violet-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-violet-700 focus:ring-4 focus:ring-violet-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Envoi en cours...</span>
              </div>
            ) : (
              'Recevoir le code SMS'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export const SMSVerificationScreen = ({ phoneData, onVerificationSuccess, onBackToPhone }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://ec8cf41e-fc2f-4f0b-a825-333abc61afac.preview.emergentagent.com';

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Veuillez saisir le code reçu');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneData.phone,
          country_code: phoneData.countryCode,
          code: code.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        onVerificationSuccess({
          sessionId: data.session_id,
          phone: phoneData.phone,
          countryCode: phoneData.countryCode
        });
      } else {
        setError(data.message || 'Code incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      console.error('Verify code error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBackToPhone}
            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérification SMS</h2>
          <p className="text-gray-600">
            Saisissez le code reçu au
          </p>
          <p className="font-semibold text-violet-600">
            {phoneData.countryCode} {phoneData.phone}
          </p>
        </div>

        {/* Code Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Code à 6 chiffres
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-violet-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-violet-700 focus:ring-4 focus:ring-violet-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Vérification...</span>
              </div>
            ) : (
              'Vérifier le code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              onClick={onBackToPhone}
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};