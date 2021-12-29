import React, {useState, useEffect} from 'react';
import './UpdateStock.css';
import PurchaseInvoice from './PurchaseInvoice';

function UpdateStock() {

    const [selectedFiles, setSelectedFiles] = useState();
    const [invoices, setInvoices] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [dateUpdateMessage, setDateUpdateMessage] = useState("")

	const changeHandler = (event) => {
		setSelectedFiles(event.target.files);
	};

    const handleSubmission = (e) => {
        e.preventDefault();
		const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append('files[]', file, file.name);
          }
        

		fetch(
			"/api/read_invoice",
			{
				method: 'POST',
				body: formData,
			}
            )
            .then((response) => response.json())
			.then((invoices) => {
                setInvoices(invoices);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            
	};

    const handleClaimOverwrite = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        if(e.target.value === "claim"){
            invoicesCopy[invoice_index].claim_invoice = true;
            invoicesCopy[invoice_index].overwrite_price_list = false;
            setInvoices(invoicesCopy);
        }        
        else{
            invoicesCopy[invoice_index].claim_invoice = false;
            invoicesCopy[invoice_index].overwrite_price_list = true;
            setInvoices(invoicesCopy);
        }
    }
    console.log(invoices)

    const handleUpdateInventory = ()=>{

        //if price not matching, and user hasn't selected claim or overwrite price, then do not post
        let selectOneError = false;
        let selectDateError = false;
        for(let i=0; i<invoices.length; i++){
            if((invoices[i].price_difference)&&(!invoices[i].claim_invoice)&&(!invoices[i].overwrite_price_list)){
                selectOneError = true;
                console.log("select either claim invoice or overwrite price list");
                break;
            }
        }


        if( (!selectOneError) && (!selectDateError) ){
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoices)
            };
            fetch("/api/update_stock", requestOptions)
                .then(response => response.json())
                .then(result => setSuccessMessage(result));
        }

    }

    const handleClaimNumber = (invoice_index, claim_item_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].claim_items[claim_item_index].claim_number = e.target.value;
        setInvoices(invoicesCopy);
        
    }

    const handleInvoiceDate = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].invoice_date = e.target.value;
        setInvoices(invoicesCopy);
    }

    const handleDateFile = (e) => {
        e.preventDefault();

		fetch("/api/initial_setup")
            .then((response) => response.json())
			.then((message) => {
                setDateUpdateMessage(message);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            
	};

    const handleSpecialDiscount = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].special_discount = e.target.value;
        setInvoices(invoicesCopy);
    }


    return (
        <div className="update-stock">
            {/* <button onClick={handleDateFile}>run date update funtion</button>
            <div> {dateUpdateMessage} </div> */}
            <h3>Upload invoice to update stock</h3>
            <form method="POST" action="" encType="multipart/form-data" >
                <p><input type="file" name="files" multiple onChange={changeHandler}/></p>
                <p><input type="submit" value="Submit"  onClick={handleSubmission}/></p>
            </form>

            <div className="invoice-items">
                {invoices.map( (invoice, invoice_index)=> 
                <PurchaseInvoice 
                    invoice={invoice} 
                    key={invoice_index}
                    invoice_index={invoice_index}
                    handleInvoiceDate={handleInvoiceDate}
                    handleClaimOverwrite={handleClaimOverwrite}
                    handleClaimNumber={handleClaimNumber}
                    handleSpecialDiscount={handleSpecialDiscount}
                />
                )}
            </div>

            {invoices.length!==0?
                <button className="update-inventory" onClick={handleUpdateInventory}>
                    Update inventory and save invoices
                </button>
            :null}
            <br/>

            {successMessage!==""?<h4>{successMessage} !</h4>:null}
            <br/>
        </div>
        
    );
}

export default UpdateStock;