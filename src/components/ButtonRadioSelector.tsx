interface Props{
    items: Array<IItem>;
    selectedValue:string;
    onValueChange: Function;
}

interface IItem{
    name:string;
    value: string;
}

const sampleRadios = [
    {name: "小",value:"s"},
    {name: "中",value:"m"},
    {name: "大",value:"l"},
]
function ButtonRadioSelector({items=sampleRadios, selectedValue, onValueChange}:Props){
    const handleOnChange = (event:React.ChangeEvent<HTMLInputElement>)=>{        
        onValueChange(event.target.value);
    }    
    
    return (
        <div className="d-flex">
            {items.map(item=>(
                <label className="fz_switch mb-0" key={item.value}>
                    <input type="radio" value={item.value} checked={ selectedValue === item.value} onChange={handleOnChange} />
                    <div className="fz_switch_btn">{item.name}</div>
                </label>
            ))}
            
        </div>
    )
}

export default ButtonRadioSelector;