import React, { Component } from 'react';
import Header from './Header';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

class Homepage extends Component {

    constructor(props) {
        window.speechSynthesis.getVoices();
        super(props);
        this.runSpeechRecognition = this.runSpeechRecognition.bind(this);
        this.GetResp = this.GetResp.bind(this);
        this.currentChat = [
            {
                "role": "system",
                "content": "Pretend that you are an educated person and not an AI"
            }
        ]
        this.state =
        {
            speaking: false,
            loading: false,
            chat: [{ "user": "AI", "message": "Hi, How can I help you ?" },
                // { "user": "AI", "message": "message2 ".repeat(100) },
                // { "user": "You", "message": "message" }, { "user": "AI", "message": "message2 ".repeat(100) }
                // , { "user": "You", "message": "message" }, { "user": "AI", "message": "message2 ".repeat(100) }
                // , { "user": "You", "message": "message" }, { "user": "AI", "message": "message2 ".repeat(100) }
                // , { "user": "You", "message": "message" }, { "user": "AI", "message": "message2 ".repeat(100) }
                // , { "user": "You", "message": "message" }, { "user": "AI", "message": "message2 ".repeat(10) }
            ],
            inputValue: ""
        };
    }

    async getWebResponse(v) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer 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");
        console.log(this.currentChat);
        // return;
        var raw = JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "Your name is Digibot. You are a program designed to help people. Do not provide further information about yourself."
                },
                {
                    "role": "user",
                    "content": v
                }
            ]
        });

        var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

        var response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
        if (!response.ok) {
            this.setState({loading:false});
            throw Error(response.statusText)
        }
        return response.text();
    }

    async GetResp() {
        this.setState({ loading: true });
        // var userPrompt = document.getElementById("content").value;
        var userPrompt = this.state.inputValue;
        // alert(userPrompt);
        // return;

        this.addChat("You", userPrompt);

        var response = JSON.parse(await this.getWebResponse(userPrompt));
        var resp = response["choices"][0]['message']["content"];
        console.log(resp);
        // resp = resp.replace(/n/g, "/n");

        // console.log(resp);

        this.addChat("AI", resp);
        window.speechSynthesis.cancel()
        const msg = new SpeechSynthesisUtterance(resp);
        var voices = window.speechSynthesis.getVoices();
        console.log(voices);
        msg.voice = voices[4];
        window.speechSynthesis.speak(msg);
        this.setState({ speaking: false, loading: false });
    }

    addChat(user, message) {

        this.currentChat = this.currentChat.concat([
            { "role": user == "You" ? "user" : "assistant", "content": message }
        ]);

        this.setState({ chat: this.state.chat.concat([{ "user": user, "message": message }]) });
    }

    updateInputValue(evt) {
        const val = evt.target.value;
        // ...       
        this.setState({
            inputValue: val
        });
    }

    async handleEnterPress(e) {
        if (e.key === 'Enter') {
            // this.GetResp();
            document.getElementById("sendreq").click();
            // await new Promise(resolve => setTimeout(resolve, 100 || 1000));
            document.getElementById("cleartext").click();

        }
    }

    ChatMessage(props) {
        return <div className="chatbox" style={{ whiteSpace: "pre-wrap" }}>
            {props.user == "You" ?
                <div className='chatflex jcl'>
                    <div className='fl'><img src="/user.png" className="chatImg" /></div>
                    <div className='chattext bsr'>{props.message}</div>
                </div>
                :
                <div className='chatflex jcr'>
                    <div className='chattext bsl'>{props.message}</div>
                    <div className='fl'><img src="/ai.png" className="chatImg" /></div>
                </div>
            }
        </div>;
    }


    runSpeechRecognition() {
        this.setState({ speaking: true });

        var getResp = this.GetResp;
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new SpeechRecognition();

        // This runs when the speech recognition service starts
        recognition.onstart = function () {
            console.log("Speech starts");
        };

        recognition.onspeechend = function () {
            console.log("End of speech");
            recognition.stop();
        }

        // This runs when the speech recognition service returns result
        recognition.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            var confidence = event.results[0][0].confidence;
            console.log(event.results[0][0].transcript);
            this.state.inputValue = event.results[0][0].transcript;
            getResp();
        };
        recognition.onresult = recognition.onresult.bind(this);

        // start recognition
        recognition.start();
    }

    LoadingAnimation() {
        return <div className="loading">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
        </div>
    }

    render() {

        return (
            <div id="homepage">
                <Header> </Header>
                <div className='navmenu'>.</div>
                <div id="mainArea">
                    <div className='sidebar'>
                        <a onClick={() => this.setState({ inputValue: "" })}>
                            <img src="/send.png" id='cleartext' />
                        </a>
                    </div>
                    <div className="chatContainer">

                        {this.state.chat.map((chat) => <this.ChatMessage user={chat["user"]} message={chat["message"]} />)}

                        {this.state.loading == true ?
                            <this.LoadingAnimation />
                            :
                            <div></div>}
                    </div>
                </div>

                <div className="footer">

                    {this.state.speaking == true ?
                        <a className="speakbtn"><img className="micimg" src="micon.webp"/> </a>
                        :
                        <a className="speakbtn" onClick={this.runSpeechRecognition}> <img className="micimg" src="mic.png"/> </a>
                        }
                    <textarea id="textarea" placeholder="Enter prompt here..." rows="1" cols="30" value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)}
                        onKeyUp={this.handleEnterPress} />
                    <a onClick={() => this.GetResp()} id="sendreq">
                        <img src="/send.png" id='sendImg' />
                    </a>
                    {/* <button onClick={() => this.GetResp()}>Submit</button> */}
                </div>

            </div>
        )
    }
}

export default Homepage