import React, {useContext} from 'react';
import { CartContext } from './CartContext';
import CartTyre from './CartTyre';
import './Cart.css';
import CartIcon from './cart-icon.png'
import { Link } from 'react-router-dom';

function Cart(){

    
    const {tyresContext, servicesContext} = useContext(CartContext);
    // eslint-disable-next-line 
    const [cart, setCart] = tyresContext;
    const [services, setServices] = servicesContext;

    const handleServicesPrice = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...services];
        servicesCopy[index].price = e.target.value;
        setServices(servicesCopy);        
    }; 

    const handleServicesQuantity = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...services];
        servicesCopy[index].quantity = e.target.value;
        setServices(servicesCopy);        
    }; 

    const handleFocus = (e) => e.target.select();

    let tyresPrice = 0;
    for(let i=0; i<cart.length; i++){
        tyresPrice = tyresPrice+cart[i].price*cart[i].quantity;
    }  

    let servicesPrice=0;
    for(let i=0; i<services.length; i++){
        servicesPrice = servicesPrice+services[i].price*services[i].quantity;
    }

    let totalPrice = tyresPrice+servicesPrice;


    return(
        <div className="cart"> 

            <div className="cart-title"> 
                CART SUMMARY
            </div>
            
            
            {cart.map( (tyre, index)=> <CartTyre tyreData={tyre} key={index}/> )}  

            <div className="service"> 
                {services.map( (service, index)=>
                <div key={index}>
                    <div className="service-name">{service.name}:</div> 
                
                    <div classname="service-grid-container">
                        <div className="service-CP"> 
                            <span class>CP: </span>
                            <input type="text"/>
                        </div>

                        <div className="service-price">
                            Price:
                            <input type="text" value={service.price} onChange={(e)=>handleServicesPrice(index,e)} onFocus={handleFocus}/>
                        </div>

                        <div className="service-quantity">
                            <span>Quantity: </span>
                            <input type="number" step="1" min="0" value={service.quantity} onChange={(e)=>handleServicesQuantity(index,e)} onFocus={handleFocus}/>
                        </div>
                        
                    </div>
                    
                     
                    
                     
                    
                    
                </div>
                )}
            </div>
            
            
            <div className="total-price">Total price: &#x20B9;{totalPrice}</div>
            <br/>
            <Link to="/invoice">Preview invoice</Link> 
        </div>
    );

}


export default Cart;