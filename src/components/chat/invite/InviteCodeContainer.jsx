import { useRef } from "react";



export default function InviteCodeContainer(props) {
    const { currentCode, setCurrentCode, codeLength} = props;
    const inputRefs = useRef([]);



    function handlePaste(event) {
        event.preventDefault();
        
        const paste = (event.clipboardData || window.clipboardData).getData('text').slice(0, codeLength);
        const newCode = paste.split('');

        setCurrentCode(newCode);

        const nextFieldIndex = newCode.length < codeLength ? newCode.length : codeLength - 1;
        inputRefs.current[nextFieldIndex].focus();
    }



    function handleKeyDown(event, index) {
        if (event.key === "Backspace" && event.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (event.key !== "Backspace") {
            if (index < codeLength - 1) {
                inputRefs.current[index].focus();
            }
        }
    }



    function handleChange(event, index) {
        const newCode = [...currentCode];
        newCode[index] = event.target.value;
        setCurrentCode(newCode);

        if (event.target.value !== '' && index < codeLength - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    

    return (
        <div className="invite-code-container" onPaste={handlePaste}>
            {currentCode.map((_, index) => (
                <div key={index}> 
                    <input 
                        ref={el => inputRefs.current[index] = el}
                        type="text" 
                        maxLength="1" 
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        onChange={(event) => handleChange(event, index)}
                        value={currentCode[index]}
                    />
                </div>
            ))}
        </div>
    );
}