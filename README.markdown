# ⚡ Energy Consumption Monitor Chatbot

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.2-green)

## Overview

The **Energy Consumption Monitor Chatbot** is a conversational web tool that helps users track, analyze, and optimize their energy usage. It provides real-time insights, personalized recommendations, and data visualization for household or business energy consumption.

## Features

- **Real-Time Monitoring:** Fetch and display current energy usage data.
- **Historical Analysis:** View trends and patterns based on past consumption.
- **Personalized Tips:** Get actionable advice to reduce energy waste.
- **Interactive Queries:** Ask questions about your energy data in natural language.
- **Data Visualization:** Generate charts and graphs for better understanding of consumption patterns.
- **CSV Upload:** Analyze your own device usage data via CSV file.
- **Custom Thresholds:** Set per-device and global energy usage limits for alerts.
- **Dark/Light Mode:** Switch between dark and light themes.
- **Login Modal:** Simple authentication for demo purposes.

## Demo

![Chatbot UI Screenshot](https://user-images.githubusercontent.com/your-repo/demo-screenshot.png)

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repo/energy-consumption-chatbot.git
   cd energy-consumption-chatbot
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the project root and add your API keys:
   ```env
   ENERGY_API_KEY=your_api_key
   CHATBOT_MODEL=your_model_name
   ```

## Usage

1. **Start the Backend Server:**
   ```bash
   python app.py
   ```
   The Flask server will run at `http://localhost:5000`.

2. **Open the Frontend:**
   Open `index.html` in your browser (double-click or use a local server).

3. **Login:**
   - Username: `user`
   - Password: `0987`

4. **Interact with the Chatbot:**
   - Type questions about your energy usage.
   - Upload a CSV file with device data (see format below).
   - Set energy thresholds in the Settings panel.

### Example Queries

- "What's my energy usage today?"
- "Show me a graph of last week's consumption."
- "How can I save energy this month?"

### CSV Format

Upload a CSV file with the following columns:
```csv
name,power,hours
Air Conditioner,1.5,8
Refrigerator,0.2,24
Washing Machine,0.5,2
Laptop,0.1,6
Television,0.08,4
```

## Project Structure

```
app.py
index.html
script.js
styles.css
requirements.txt
README.markdown
device.csv
```

## Dependencies

- Python 3.8+
- [Flask](https://flask.palletsprojects.com/) (`flask`, `flask-restful`)
- [requests](https://docs.python-requests.org/)
- [python-dotenv](https://pypi.org/project/python-dotenv/)
- [gunicorn](https://gunicorn.org/) (for production)
- Google Generative AI SDK (Gemini)
- Frontend: HTML, CSS, JavaScript

## Development Notes

- Modular design: separate backend (Flask) and frontend (HTML/JS/CSS).
- Uses Google Gemini for natural language responses.
- Matplotlib and pandas can be added for advanced data visualization.
- For web-based deployment, ensure compatibility with Pyodide if using pygame for audio features.

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

For issues or suggestions, open an issue on the repository or contact the project maintainers.