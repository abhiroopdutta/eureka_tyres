import { Link } from 'react-router-dom';
import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';
import './Invoice.css';

//to-do: date should update real time by chance invoice creation takes place near midnight
function getCurrentDate(separator=''){

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  
  return `${date}${separator}${month<10?`0${month}`:`${month}`}${separator}${year}`;
  };

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}


function Invoice() {

  const {tyresContext, servicesContext} = useContext(CartContext);
  // eslint-disable-next-line
  const [cart, setCart] = tyresContext;
  // eslint-disable-next-line
  const [services, setServices] = servicesContext;

  //store rate per item in backend
  const [purchasedProducts, setPurchasedProducts] = useState(cart.map((product)=>{
    return {
      type:"product",
      desc:product.desc,
      id:product.id,
      HSN:product.HSN,
      CP:parseFloat(product.CP),
      ratePerItem:roundToTwo(parseFloat(product.price)/1.28),
      quantity:parseInt(product.quantity),
      CGST:parseFloat(0.14),
      SGST:parseFloat(0.14),
      IGST:parseFloat(0)
    };
  }));

  //give unique id for each service
  const [purchasedServices, setPurchasedServices] = useState(services.map((service)=>{
    return {
      type:"service",
      name:service.name,
      HSN:service.HSN,
      ratePerItem:roundToTwo((parseFloat(service.price)/1.18)),
      quantity:parseInt(service.quantity),
      CGST:0.09,
      SGST:0.09
    };
  }));


  //render different tables depending on IGST customer or not
  const [IGSTRender, SetIGSTRender] = useState(false);

  
  const handlePrint = () =>{
    window.print();
  }

  //if customer GSTIN doesn't start with 09, then IGST
  const handleIGST = (e) =>{
    let purchasedProductsCopy = [...purchasedProducts];

    if(e.target.value==="0"||e.target.value.startsWith("09")||!e.target.value){
      for(let i=0; i<purchasedProductsCopy.length; i++){    
        purchasedProductsCopy[i].IGST = parseFloat(0);
        purchasedProductsCopy[i].CGST = parseFloat(0.14);
        purchasedProductsCopy[i].SGST = parseFloat(0.14);
      }
      SetIGSTRender(false);
    }

    else{
      for(let i=0; i<purchasedProductsCopy.length; i++){    
        purchasedProductsCopy[i].IGST = parseFloat(0.28);
        purchasedProductsCopy[i].CGST = parseFloat(0);
        purchasedProductsCopy[i].SGST = parseFloat(0);
      }
      SetIGSTRender(true);
    }
 
    //comment the below line and state is still updated IGST value, how???!!
    setPurchasedProducts(purchasedProductsCopy);
  }

  //calculate all column values for tyres
  let productsTable = [];
  for(let i=0; i<purchasedProducts.length; i++){
    productsTable.push({
      desc:purchasedProducts[i].desc,
      HSN:purchasedProducts[i].HSN,
      quantity:purchasedProducts[i].quantity,
      ratePerItem:purchasedProducts[i].ratePerItem,
      taxableValue:roundToTwo(purchasedProducts[i].ratePerItem*purchasedProducts[i].quantity),
      CGSTRate:roundToTwo(purchasedProducts[i].CGST*100),
      CGSTAmount:parseFloat(0),
      SGSTRate:roundToTwo(purchasedProducts[i].SGST*100),
      SGSTAmount:parseFloat(0),
      IGSTRate:roundToTwo(purchasedProducts[i].IGST*100),
      IGSTAmount:parseFloat(0),
      valueForGST:parseFloat(0),
      valueForIGST:parseFloat(0)
    });

    productsTable[i].CGSTAmount=roundToTwo(purchasedProducts[i].CGST*productsTable[i].taxableValue);
    productsTable[i].SGSTAmount=roundToTwo(purchasedProducts[i].SGST*productsTable[i].taxableValue);
    productsTable[i].IGSTAmount=roundToTwo(purchasedProducts[i].IGST*productsTable[i].taxableValue);
    productsTable[i].valueForGST=roundToTwo(productsTable[i].taxableValue+productsTable[i].CGSTAmount+productsTable[i].SGSTAmount);
    productsTable[i].valueForIGST=roundToTwo(productsTable[i].taxableValue+productsTable[i].IGSTAmount);

  }


  //calculate all column values for services
  let servicesTable = [];
  for(let i=0; i<purchasedServices.length; i++){
    servicesTable.push({
      name:purchasedServices[i].name,
      HSN:purchasedServices[i].HSN,
      quantity:parseInt(purchasedServices[i].quantity),
      ratePerItem:purchasedServices[i].ratePerItem,
      taxableValue:roundToTwo(parseFloat(purchasedServices[i].ratePerItem)*purchasedServices[i].quantity),
      CGSTRate:roundToTwo(purchasedServices[i].CGST*100),
      CGSTAmount:0,
      SGSTRate:roundToTwo(purchasedServices[i].SGST*100),
      SGSTAmount:0,
      value:parseFloat(0),
    });

    servicesTable[i].CGSTAmount=roundToTwo(purchasedServices[i].CGST*servicesTable[i].taxableValue);
    servicesTable[i].SGSTAmount=roundToTwo(purchasedServices[i].SGST*servicesTable[i].taxableValue);
    servicesTable[i].value=roundToTwo(servicesTable[i].taxableValue+servicesTable[i].CGSTAmount+servicesTable[i].SGSTAmount);
  }


  //calculate total for products (tyres, tubes)
  let totalProductQuantity = 0;
  let totalProductTaxableValue = 0;
  let totalProductCGST = 0;
  let totalProductSGST = 0;
  let totalProductIGST = 0;
  let totalProductValueForGST = 0;
  let totalProductValueForIGST = 0;
  for(let i=0; i<productsTable.length; i++){
    totalProductQuantity += productsTable[i].quantity;
    totalProductTaxableValue += productsTable[i].taxableValue;
    totalProductIGST += productsTable[i].IGSTAmount;
    totalProductCGST += productsTable[i].CGSTAmount;
    totalProductSGST += productsTable[i].SGSTAmount;
    totalProductValueForGST += productsTable[i].valueForGST;
    totalProductValueForIGST += productsTable[i].valueForIGST;
  }

  //round off 
  totalProductTaxableValue = roundToTwo(totalProductTaxableValue);
  totalProductIGST = roundToTwo(totalProductIGST);
  totalProductCGST = roundToTwo(totalProductCGST);
  totalProductSGST = roundToTwo(totalProductSGST);
  totalProductValueForGST = roundToTwo(totalProductValueForGST);
  totalProductValueForIGST = roundToTwo(totalProductValueForIGST);


  //calculate total for services
  let totalServiceQuantity = 0;
  let totalServiceTaxableValue = 0;
  let totalServiceCGST = 0;
  let totalServiceSGST = 0;
  let totalServiceValue = 0;
  for(let i=0; i<servicesTable.length; i++){
    totalServiceQuantity += servicesTable[i].quantity;
    totalServiceTaxableValue += servicesTable[i].taxableValue;
    totalServiceCGST += servicesTable[i].CGSTAmount;
    totalServiceSGST+= servicesTable[i].SGSTAmount;
    totalServiceValue += servicesTable[i].value;
  }

  //round off 
  totalServiceTaxableValue = roundToTwo(totalServiceTaxableValue );
  totalServiceCGST = roundToTwo(totalServiceCGST);
  totalServiceSGST = roundToTwo(totalServiceSGST);
  totalServiceValue = roundToTwo(totalServiceValue);



  //calculate absolute total(will be used only for GST since IGST will have total only for tyres)
  let totalQuantity = totalProductQuantity + totalServiceQuantity;
  let totalTaxableValue =  roundToTwo(totalProductTaxableValue + totalServiceTaxableValue);
  let totalCGST =  roundToTwo(totalProductCGST + totalServiceCGST);
  let totalSGST =  roundToTwo(totalProductSGST + totalServiceSGST);
  let totalValueForGST =  roundToTwo(totalProductValueForGST + totalServiceValue);


  //write a function to query the database for invoice number

  return (
    <div className="invoice-component">
      <button className="print-button" onClick={handlePrint}>PRINT</button>
      <Link className = "back-to-shop" to="/create_order">Go back to shop</Link>
      <div className="invoice-body">          
        <div className="invoice-details">
          <div className="shop-name">EUREKA TYRES</div>
          <div className="invoice-no"> Tax Invoice #: 002</div>
          <br/>
          <div className="shop-description">APOLLO PV ZONE</div>
          <div className="invoice-date">Invoice Date: {getCurrentDate("/")}</div>
          <br/>
          <div className="shop-address-1">52/42/6A, Tashkand Marg, Civil Lines, Allahabad</div>
          <div className="shop-GSTIN">GSTIN: 09FWTPD4101B1ZT</div>
          <div className="shop-address-2">Uttar Pradesh - 211001 | +91 94355 55596</div>          
          <div className="shop-GSTIN-area">State: Uttar Pradesh, Code:09</div> 
        </div>
        {/*this below div only required for css float left and right for above lines*/}
        <div style={{clear:"both"}}></div>      
        <hr/>
        <br/>
        <br/>
        <div className="customer-details">Bill To: <input type="text" />
          <br/>
          Address: <input type="text" />
          <br/>
          GSTIN: <input type="text" maxlength="15" onChange={handleIGST} />
          <br/>
          Code: <input type="text" maxlength="2"/>
          State: <input type="text" />
          <br/>
          Vehicle No. : <input type="text" />
          <br/>
          Contact: <input type="text" />
        </div>
        <br/>

        {IGSTRender?
        <div>
          <table className="IGST-table">
            <tr>
              <th className="particulars" rowSpan="2">Particulars</th>
              <th className="HSNCode" rowSpan="2">HSN-Code</th>
              <th className="Qty" rowSpan="2">Qty</th>
              <th className="Rate-per-item" rowSpan="2">Rate per Item</th>
              <th className="taxable-value" rowSpan="2">Taxable value</th>
              <th colSpan="2" scope="colgroup">IGST</th>
              <th className="value" rowSpan="2">Value</th>
            </tr>
            <tr>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
            </tr>

            {productsTable.map( (tyre, index) =>
            <tr key={index}>
              <td>{tyre.desc}</td>
              <td>{tyre.HSN}</td>
              <td>{tyre.quantity}</td>
              <td>{tyre.ratePerItem}</td>
              <td>{tyre.taxableValue}</td>
              <td className="IGST-cell">{tyre.IGSTRate}%</td>
              <td> {tyre.IGSTAmount} </td>
              <td>{tyre.valueForIGST}</td>
            </tr>
            )}

            <tr>
              <th>Net Amount</th>
              <td>-</td>
              <td>{totalProductQuantity}</td>
              <td>-</td>
              <td>{totalProductTaxableValue}</td>
              <td>-</td>
              <td>{totalProductIGST}</td>
              <td>{totalProductValueForIGST}</td>
            </tr>
          </table>
          <br/>
          <br/>
          <table className="rounding-table">
            <tr>
              <th>Rounding off</th>
              <td>{roundToTwo(Math.round(totalProductValueForIGST)-totalProductValueForIGST)}</td>
            </tr>
            <tr>
              <th>Total</th>
              <td>{Math.round(totalProductValueForIGST)}</td>
            </tr>
          </table>
          <br/>
          <br/>
        </div>
          :
        <div>
          <table className="GST-table">
            <tr>
              <th className="particulars" rowSpan="2">Particulars</th>
              <th className="HSNCode" rowSpan="2">HSN-Code</th>
              <th className="Qty" rowSpan="2">Qty</th>
              <th className="Rate-per-item" rowSpan="2">Rate per Item</th>
              <th className="taxable-value" rowSpan="2">Taxable value</th>
              <th colSpan="2" scope="colgroup">CGST</th>
              <th colSpan="2" scope="colgroup">SGST</th>
              <th className="value" rowSpan="2">Value</th>
            </tr>
            <tr>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
            </tr>

            {productsTable.map( (tyre, index) =>
            <tr key={index}>
              <td>{tyre.desc}</td>
              <td>{tyre.HSN}</td>
              <td>{tyre.quantity}</td>
              <td>{tyre.ratePerItem}</td>
              <td>{tyre.taxableValue}</td>
              <td>{tyre.CGSTRate}%</td>
              <td>{tyre.CGSTAmount}</td>
              <td>{tyre.SGSTRate}%</td>
              <td>{tyre.SGSTAmount}</td>
              <td>{tyre.valueForGST}</td>
            </tr>
            )}
        
            {servicesTable.map( (service, index) => {if(service.quantity>0){return(
            <tr key={index}>
              <td>{service.name}</td>
              <td>{service.HSN}</td>
              <td>{service.quantity}</td>
              <td>{service.ratePerItem}</td>
              <td>{service.taxableValue}</td>
              <td>{service.CGSTRate}%</td>
              <td>{service.CGSTAmount}</td>
              <td>{service.SGSTRate}%</td>
              <td>{service.SGSTAmount}</td>
              <td>{service.value}</td>
            </tr>
              );}
              return null;
              }          
            )}

            <tr>
              <th>Net Amount</th>
              <td>-</td>
              <td>{roundToTwo(totalQuantity)}</td>
              <td>-</td>
              <td>{roundToTwo(totalTaxableValue)}</td>
              <td>-</td>
              <td>{roundToTwo(totalCGST)}</td>
              <td>-</td>
              <td>{roundToTwo(totalSGST)}</td>
              <td>{roundToTwo(totalValueForGST)}</td>
            </tr>

          </table>
          <br/>
          <table className="rounding-table">
            <tr>
              <th>Rounding off</th>
              <td>{roundToTwo(Math.round(totalValueForGST)-roundToTwo(totalValueForGST))}</td>
            </tr>
            <tr>
              <th>Total</th>
              <td>{Math.round(totalValueForGST)}</td>
            </tr>
          </table>
          <br/>
          <br/>
        </div>

        }
        <br/>
        <br/>
        <br/>
        <div className="bank-name">Bank of Maharashtra A/c No. 60386889626</div>
        <div className="signatory-name">For EUREKA TYRES</div>
        <br/>
        <div className="bank-details">RTGS-NEFT-IFSC Code - MAHB0001291</div>
        <div className="signature"></div>
        <br/>
        <br/>
        <div className="eoe">E. &#38; O. E.</div>
        <div className="signatory">Authorised Signatory</div>
        <div style={{clear:"both"}}></div> 

      </div>  
    </div>
       
  );
}


export default Invoice;